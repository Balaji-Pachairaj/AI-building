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

const initialState = {
  // Models list
  models: [],
  modelsLoading: false,
  modelsError: null,
  selectedModelId: 1,

  // Prediction playground
  generation: {
    loading: false,
    result: null,
    error: null,
    latency: null,
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
    // Generate Next Tokens
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

export const { setSelectedModelId, clearGeneration, setHistoryPage } = nextTokenSlice.actions;

export default nextTokenSlice.reducer;
