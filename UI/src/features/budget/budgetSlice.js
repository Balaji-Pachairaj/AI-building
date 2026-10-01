import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import budgetApi from '../../api/budgetApi';

// Helper to get default date strings (start of current month to today)
export const getDefaultDateRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-${day}`;
  return { startDate, endDate };
};

// Async thunks
export const fetchDashboardSummary = createAsyncThunk(
  'budget/fetchDashboardSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await budgetApi.getDashboardSummary(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTags = createAsyncThunk(
  'budget/fetchTags',
  async (params, { rejectWithValue }) => {
    try {
      const response = await budgetApi.getTags(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createTag = createAsyncThunk(
  'budget/createTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const response = await budgetApi.createTag(tagData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteTag = createAsyncThunk(
  'budget/deleteTag',
  async (id, { rejectWithValue }) => {
    try {
      const response = await budgetApi.deleteTag(id);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const logTransaction = createAsyncThunk(
  'budget/logTransaction',
  async (txData, { rejectWithValue }) => {
    try {
      const response = await budgetApi.createTransaction(txData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'budget/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await budgetApi.getTransactions(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'budget/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await budgetApi.deleteTransaction(id);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTagAnalysis = createAsyncThunk(
  'budget/fetchTagAnalysis',
  async ({ tagName, params }, { rejectWithValue }) => {
    try {
      const response = await budgetApi.getTagAnalysis(tagName, params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const { startDate, endDate } = getDefaultDateRange();

const initialState = {
  // Global date filter for Budget Padmanabhan
  dateRange: {
    startDate,
    endDate,
  },

  // Dashboard state
  dashboard: {
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    data: null,
    error: null,
  },

  // Tags state
  tagsList: {
    status: 'idle',
    items: [],
    error: null,
  },

  // Tag creation state
  tagCreate: {
    status: 'idle',
    error: null,
  },

  // Transactions state
  transactions: {
    status: 'idle',
    items: [],
    summary: null,
    pagination: null,
    error: null,
  },

  // Transaction logging state
  transactionCreate: {
    status: 'idle',
    error: null,
    lastCreated: null,
  },

  // Tag Analysis state
  tagAnalysis: {
    status: 'idle',
    data: null,
    error: null,
  },

  currency: '₹',
};

export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange.startDate = action.payload.startDate;
      state.dateRange.endDate = action.payload.endDate;
    },
    resetDateRangeToCurrentMonth: (state) => {
      const defaults = getDefaultDateRange();
      state.dateRange.startDate = defaults.startDate;
      state.dateRange.endDate = defaults.endDate;
    },
    resetTransactionCreateStatus: (state) => {
      state.transactionCreate.status = 'idle';
      state.transactionCreate.error = null;
      state.transactionCreate.lastCreated = null;
    },
    resetTagCreateStatus: (state) => {
      state.tagCreate.status = 'idle';
      state.tagCreate.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.dashboard.status = 'loading';
        state.dashboard.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.dashboard.status = 'succeeded';
        state.dashboard.data = action.payload;
        if (action.payload.budgetOverview?.currency) {
          state.currency = action.payload.budgetOverview.currency;
        }
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.dashboard.status = 'failed';
        state.dashboard.error = action.payload;
      })

      // Tags
      .addCase(fetchTags.pending, (state) => {
        state.tagsList.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tagsList.status = 'succeeded';
        state.tagsList.items = action.payload.tags || [];
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.tagsList.status = 'failed';
        state.tagsList.error = action.payload;
      })

      // Create Tag
      .addCase(createTag.pending, (state) => {
        state.tagCreate.status = 'loading';
        state.tagCreate.error = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.tagCreate.status = 'succeeded';
        if (action.payload.tag) {
          state.tagsList.items.push(action.payload.tag);
        }
      })
      .addCase(createTag.rejected, (state, action) => {
        state.tagCreate.status = 'failed';
        state.tagCreate.error = action.payload;
      })

      // Delete Tag
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tagsList.items = state.tagsList.items.filter((t) => t._id !== action.payload.id);
        if (state.dashboard.data?.tagsSummary) {
          state.dashboard.data.tagsSummary = state.dashboard.data.tagsSummary.filter(
            (t) => t._id !== action.payload.id
          );
        }
      })

      // Log Transaction
      .addCase(logTransaction.pending, (state) => {
        state.transactionCreate.status = 'loading';
        state.transactionCreate.error = null;
      })
      .addCase(logTransaction.fulfilled, (state, action) => {
        state.transactionCreate.status = 'succeeded';
        state.transactionCreate.lastCreated = action.payload.transaction;
      })
      .addCase(logTransaction.rejected, (state, action) => {
        state.transactionCreate.status = 'failed';
        state.transactionCreate.error = action.payload;
      })

      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.transactions.status = 'loading';
        state.transactions.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions.status = 'succeeded';
        state.transactions.items = action.payload.transactions || [];
        state.transactions.summary = action.payload.summary || null;
        state.transactions.pagination = action.payload.pagination || null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactions.status = 'failed';
        state.transactions.error = action.payload;
      })

      // Delete Transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions.items = state.transactions.items.filter((t) => t._id !== action.payload.id);
      })

      // Tag Analysis
      .addCase(fetchTagAnalysis.pending, (state) => {
        state.tagAnalysis.status = 'loading';
        state.tagAnalysis.error = null;
      })
      .addCase(fetchTagAnalysis.fulfilled, (state, action) => {
        state.tagAnalysis.status = 'succeeded';
        state.tagAnalysis.data = action.payload;
      })
      .addCase(fetchTagAnalysis.rejected, (state, action) => {
        state.tagAnalysis.status = 'failed';
        state.tagAnalysis.error = action.payload;
      });
  },
});

export const {
  setDateRange,
  resetDateRangeToCurrentMonth,
  resetTransactionCreateStatus,
  resetTagCreateStatus,
} = budgetSlice.actions;

export default budgetSlice.reducer;
