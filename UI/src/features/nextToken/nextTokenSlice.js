import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import nextTokenApi from '../../api/nextTokenApi';
import { addNotification } from '../notifications/notificationSlice';

/**
 * Async Thunk: Fetch available models
 */
export const fetchModels = createAsyncThunk(
  'nextToken/fetchModels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await nextTokenApi.getModels();
      return response.models || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch models');
    }
  }
);

/**
 * Async Thunk: Generate next tokens
 */
export const generateNextTokens = createAsyncThunk(
  'nextToken/generateNextTokens',
  async ({ input, tokens, model_id }, { dispatch, getState, rejectWithValue }) => {
    try {
      const result = await nextTokenApi.getNextToken({ input, tokens, model_id });

      // Automatically refresh history to show newly saved record
      const { limit } = getState().nextToken.history;
      dispatch(fetchHistory({ page: 1, limit }));

      dispatch(
        addNotification({
          type: 'success',
          title: 'Tokens Generated',
          message: `Generated ${tokens} token(s) using ${result.data.model_name}`,
        })
      );

      return result;
    } catch (err) {
      return rejectWithValue(err.message || 'Token generation failed');
    }
  }
);

/**
 * Async Thunk: Fetch token generation history
 */
export const fetchHistory = createAsyncThunk(
  'nextToken/fetchHistory',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await nextTokenApi.getHistory({ page, limit });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch token history');
    }
  }
);

/**
 * Space-aware token appending helper that handles model subwords and whole words
 */
export const appendTokenToPrompt = (prompt, token) => {
  if (!token) return prompt;
  if (!prompt || prompt.length === 0) {
    return token.trimStart();
  }

  // 1. If token already starts with whitespace (e.g. " sleeping")
  if (/^\s/.test(token)) {
    return prompt.replace(/\s+$/, '') + token;
  }

  // 2. If token is a suffix/subword or punctuation
  if (
    /^[.,!?;:'")\]}]/.test(token) ||
    /^(ing|ed|s|es|ly|er|est|tion|ment|ful|ness|able|ible|y)\b/i.test(token)
  ) {
    return prompt.replace(/\s+$/, '') + token;
  }

  // 3. If prompt already ends in whitespace
  if (/\s$/.test(prompt)) {
    return prompt + token;
  }

  // 4. Default: separate words with a space
  return `${prompt} ${token}`;
};

/**
 * Async Thunk: Fetch next-token probability distribution
 */
export const fetchProbabilityDistribution = createAsyncThunk(
  'nextToken/fetchProbabilityDistribution',
  async ({ prompt, topK = 10, model_id = 1 }, { rejectWithValue }) => {
    try {
      const result = await nextTokenApi.predictProbabilityDistribution({
        prompt,
        topK,
        model_id,
      });
      return result;
    } catch (err) {
      return rejectWithValue(err.message || 'Probability distribution prediction failed');
    }
  }
);

const initialState = {
  // Active Tab: 'current' (Sequence generation) | 'distribution' (Probability distribution)
  activeTab: 'distribution',

  // Models list
  models: [],
  modelsLoading: false,
  modelsError: null,
  selectedModelId: 1,

  // Prediction playground (Tab 1: Current Next Token Generation)
  generation: {
    loading: false,
    result: null,
    error: null,
    latency: null,
  },

  // Probability Distribution (Tab 2: Probability Distribution Explorer)
  distribution: {
    prompt: 'The cat is',
    topK: 10,
    predictions: [],
    loading: false,
    error: null,
    latency: null,
    historyTrail: [], // breadcrumbs of added tokens
  },

  // History table
  history: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    loading: false,
    error: null,
  },
};

const nextTokenSlice = createSlice({
  name: 'nextToken',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedModelId: (state, action) => {
      state.selectedModelId = Number(action.payload);
    },
    clearGeneration: (state) => {
      state.generation.result = null;
      state.generation.error = null;
      state.generation.latency = null;
    },
    setHistoryPage: (state, action) => {
      state.history.page = action.payload;
    },
    // Probability Distribution reducers
    setDistributionPrompt: (state, action) => {
      state.distribution.prompt = action.payload;
    },
    setDistributionTopK: (state, action) => {
      state.distribution.topK = Math.min(20, Math.max(1, Number(action.payload) || 10));
    },
    addTokenToPrompt: (state, action) => {
      const token = action.payload;
      const prevPrompt = state.distribution.prompt;
      const nextPrompt = appendTokenToPrompt(prevPrompt, token);
      state.distribution.prompt = nextPrompt;
      state.distribution.historyTrail.push({
        token,
        previousPrompt: prevPrompt,
        newPrompt: nextPrompt,
        timestamp: Date.now(),
      });
    },
    undoLastToken: (state) => {
      if (state.distribution.historyTrail.length > 0) {
        const lastStep = state.distribution.historyTrail.pop();
        state.distribution.prompt = lastStep.previousPrompt;
      }
    },
    clearDistributionTrail: (state) => {
      state.distribution.historyTrail = [];
    },
    clearDistributionPredictions: (state) => {
      state.distribution.predictions = [];
      state.distribution.error = null;
      state.distribution.latency = null;
    },
  },
  extraReducers: (builder) => {
    // ----------------------------------------------------
    // Fetch Models
    // ----------------------------------------------------
    builder
      .addCase(fetchModels.pending, (state) => {
        state.modelsLoading = true;
        state.modelsError = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.modelsLoading = false;
        state.models = action.payload;
        // Default selectedModelId to the first available model if not set
        if (action.payload.length > 0 && !state.selectedModelId) {
          state.selectedModelId = action.payload[0].model_id;
        }
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.modelsLoading = false;
        state.modelsError = action.payload;
      });

    // ----------------------------------------------------
    // Generate Next Tokens (Tab 1)
    // ----------------------------------------------------
    builder
      .addCase(generateNextTokens.pending, (state) => {
        state.generation.loading = true;
        state.generation.error = null;
      })
      .addCase(generateNextTokens.fulfilled, (state, action) => {
        state.generation.loading = false;
        state.generation.result = action.payload.data;
        state.generation.latency = action.payload.duration;
      })
      .addCase(generateNextTokens.rejected, (state, action) => {
        state.generation.loading = false;
        state.generation.error = action.payload;
      });

    // ----------------------------------------------------
    // Probability Distribution (Tab 2)
    // ----------------------------------------------------
    builder
      .addCase(fetchProbabilityDistribution.pending, (state) => {
        state.distribution.loading = true;
        state.distribution.error = null;
      })
      .addCase(fetchProbabilityDistribution.fulfilled, (state, action) => {
        state.distribution.loading = false;
        state.distribution.predictions = action.payload.data?.predictions || [];
        state.distribution.latency = action.payload.duration;
      })
      .addCase(fetchProbabilityDistribution.rejected, (state, action) => {
        state.distribution.loading = false;
        state.distribution.error = action.payload;
      });

    // ----------------------------------------------------
    // Fetch History
    // ----------------------------------------------------
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.history.loading = true;
        state.history.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history.loading = false;
        state.history.items = action.payload.data || [];
        state.history.total = action.payload.total || 0;
        state.history.page = action.payload.page || 1;
        state.history.limit = action.payload.limit || 10;
        state.history.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.history.loading = false;
        state.history.error = action.payload;
      });
  },
});

export const {
  setActiveTab,
  setSelectedModelId,
  clearGeneration,
  setHistoryPage,
  setDistributionPrompt,
  setDistributionTopK,
  addTokenToPrompt,
  undoLastToken,
  clearDistributionTrail,
  clearDistributionPredictions,
} = nextTokenSlice.actions;

export default nextTokenSlice.reducer;
