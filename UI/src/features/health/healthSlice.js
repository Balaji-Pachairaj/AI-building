import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHealthCheck, fetchRootInfo } from '../../api/healthApi';

export const checkServerHealth = createAsyncThunk(
  'health/checkServerHealth',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchHealthCheck();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Health check failed');
    }
  }
);

export const checkRootApi = createAsyncThunk(
  'health/checkRootApi',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchRootInfo();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Root check failed');
    }
  }
);

const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  healthData: null,
  rootData: null,
  lastChecked: null,
  duration: null,
  error: null,
  autoRefresh: false,
};

export const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    toggleAutoRefresh: (state) => {
      state.autoRefresh = !state.autoRefresh;
    },
    resetHealthState: (state) => {
      state.status = 'idle';
      state.healthData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkServerHealth
      .addCase(checkServerHealth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkServerHealth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.healthData = action.payload;
        state.duration = action.payload.duration;
        state.lastChecked = new Date().toISOString();
        state.error = null;
      })
      .addCase(checkServerHealth.rejected, (state, action) => {
        state.status = 'failed';
        state.healthData = null;
        state.lastChecked = new Date().toISOString();
        state.error = action.payload || 'Failed to connect to backend';
      })
      // checkRootApi
      .addCase(checkRootApi.fulfilled, (state, action) => {
        state.rootData = action.payload;
      });
  },
});

export const { toggleAutoRefresh, resetHealthState } = healthSlice.actions;

export default healthSlice.reducer;
