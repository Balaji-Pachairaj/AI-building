import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sleepApi from '../../api/sleepApi';

// =========================================================================
// Async Thunks
// =========================================================================

/**
 * Fetch current sleep status (is sleeping, active session, last completed session)
 */
export const fetchSleepStatus = createAsyncThunk(
  'sleep/fetchSleepStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sleepApi.getSleepStatus();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch sleep status');
    }
  }
);

/**
 * User clicks "Going to Sleep"
 */
export const recordSleep = createAsyncThunk(
  'sleep/recordSleep',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const response = await sleepApi.recordSleep(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to record sleep');
    }
  }
);

/**
 * User clicks "Wake Up"
 */
export const recordWakeUp = createAsyncThunk(
  'sleep/recordWakeUp',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const response = await sleepApi.recordWakeUp(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to record wake up');
    }
  }
);

/**
 * Fetch comprehensive sleep analytics & charts
 */
export const fetchSleepAnalytics = createAsyncThunk(
  'sleep/fetchSleepAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sleepApi.getSleepAnalytics();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch sleep analytics');
    }
  }
);

/**
 * Delete a sleep session
 */
export const deleteSleepSession = createAsyncThunk(
  'sleep/deleteSleepSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await sleepApi.deleteSleepSession(sessionId);
      return { sessionId, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete session');
    }
  }
);

/**
 * Update a sleep session
 */
export const updateSleepSession = createAsyncThunk(
  'sleep/updateSleepSession',
  async ({ sessionId, updates }, { rejectWithValue }) => {
    try {
      const response = await sleepApi.updateSleepSession(sessionId, updates);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update session');
    }
  }
);

// =========================================================================
// Slice Definition
// =========================================================================

const initialState = {
  isCurrentlySleeping: false,
  activeSession: null,
  lastCompletedSession: null,
  totalSessionsCount: 0,
  nextSessionNumber: 1,

  // Analytics data
  metrics: {
    totalSleepSessions: 0,
    totalSleepHours: 0,
    avgSleepHours: 0,
    minSleepHours: 0,
    maxSleepHours: 0,
    optimalCount: 0,
    optimalSleepPercent: 0,
    avgBedtime: 'N/A',
    avgWakeTime: 'N/A',
  },
  charts: {
    sleepTrend: [],
    qualityDistribution: [],
  },
  records: [],

  // Loading states
  statusLoading: false,
  actionLoading: false,
  analyticsLoading: false,

  // Feedback & errors
  error: null,
  lastActionMessage: null,
};

const sleepSlice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {
    clearSleepError: (state) => {
      state.error = null;
    },
    clearActionMessage: (state) => {
      state.lastActionMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. fetchSleepStatus
    builder
      .addCase(fetchSleepStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(fetchSleepStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.isCurrentlySleeping = action.payload.isCurrentlySleeping;
        state.activeSession = action.payload.activeSession;
        state.lastCompletedSession = action.payload.lastCompletedSession;
        state.totalSessionsCount = action.payload.totalSessionsCount;
        state.nextSessionNumber = action.payload.nextSessionNumber;
      })
      .addCase(fetchSleepStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload;
      });

    // 2. recordSleep
    builder
      .addCase(recordSleep.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(recordSleep.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isCurrentlySleeping = true;
        state.activeSession = action.payload.session;
        state.lastActionMessage = action.payload.message;
      })
      .addCase(recordSleep.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // 3. recordWakeUp
    builder
      .addCase(recordWakeUp.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(recordWakeUp.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isCurrentlySleeping = false;
        state.lastCompletedSession = action.payload.session;
        state.activeSession = null;
        state.totalSessionsCount += 1;
        state.lastActionMessage = action.payload.message;
      })
      .addCase(recordWakeUp.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // 4. fetchSleepAnalytics
    builder
      .addCase(fetchSleepAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchSleepAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.metrics = action.payload.metrics || state.metrics;
        state.charts = action.payload.charts || state.charts;
        state.records = action.payload.records || [];
        if (action.payload.metrics?.isCurrentlySleeping !== undefined) {
          state.isCurrentlySleeping = action.payload.metrics.isCurrentlySleeping;
          state.activeSession = action.payload.metrics.activeSession;
        }
      })
      .addCase(fetchSleepAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // 5. deleteSleepSession
    builder
      .addCase(deleteSleepSession.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteSleepSession.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedId = action.payload.sessionId;
        state.records = state.records.filter((r) => r._id !== deletedId);
        state.charts.sleepTrend = state.charts.sleepTrend.filter((r) => r.sessionNumber !== action.payload.sessionId);
        state.totalSessionsCount = Math.max(0, state.totalSessionsCount - 1);
        state.lastActionMessage = 'Session deleted successfully';
      })
      .addCase(deleteSleepSession.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // 6. updateSleepSession
    builder
      .addCase(updateSleepSession.fulfilled, (state, action) => {
        if (action.payload?.session) {
          const updated = action.payload.session;
          state.records = state.records.map((r) => (r._id === updated._id ? updated : r));
        }
      });
  },
});

export const { clearSleepError, clearActionMessage } = sleepSlice.actions;
export default sleepSlice.reducer;

