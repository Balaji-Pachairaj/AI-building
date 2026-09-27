import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchLogs, fetchLogById, clearAllLogs } from '../../api/logApi';

export const fetchLogsThunk = createAsyncThunk(
  'logs/fetchLogs',
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const data = await fetchLogs(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch logs');
    }
  }
);

export const fetchLogByIdThunk = createAsyncThunk(
  'logs/fetchLogById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchLogById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch log details');
    }
  }
);

export const clearAllLogsThunk = createAsyncThunk(
  'logs/clearAllLogs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await clearAllLogs();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to clear logs');
    }
  }
);

const initialState = {
  logs: [],
  selectedLog: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    count: 0,
  },
  loading: false,
  clearing: false,
  error: null,
};

export const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    setSelectedLog: (state, action) => {
      state.selectedLog = action.payload;
    },
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLogs
      .addCase(fetchLogsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.data || [];
        state.pagination.page = action.payload.page || 1;
        state.pagination.total = action.payload.total || 0;
        state.pagination.totalPages = action.payload.totalPages || 1;
        state.pagination.count = action.payload.count || 0;
      })
      .addCase(fetchLogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchLogById
      .addCase(fetchLogByIdThunk.fulfilled, (state, action) => {
        state.selectedLog = action.payload.data;
      })
      // clearAllLogs
      .addCase(clearAllLogsThunk.pending, (state) => {
        state.clearing = true;
      })
      .addCase(clearAllLogsThunk.fulfilled, (state) => {
        state.clearing = false;
        state.logs = [];
        state.pagination.total = 0;
        state.pagination.totalPages = 1;
        state.selectedLog = null;
      })
      .addCase(clearAllLogsThunk.rejected, (state, action) => {
        state.clearing = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedLog, clearSelectedLog, setPage } = logsSlice.actions;

export default logsSlice.reducer;
