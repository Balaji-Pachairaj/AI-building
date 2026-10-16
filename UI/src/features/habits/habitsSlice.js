import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// =========================================================================
// Async Thunks
// =========================================================================

/**
 * Fetch all habits list
 */
export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/habits');
      return response.data.habits || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch habits');
    }
  }
);

/**
 * Fetch current day tracking status (is tracker started? active day? today's hits?)
 */
export const fetchCurrentDayStatus = createAsyncThunk(
  'habits/fetchCurrentDayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/habits/days/current');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch day status');
    }
  }
);

/**
 * Start Habit Tracker / Start Next Day
 */
export const startDay = createAsyncThunk(
  'habits/startDay',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/habits/days/start', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start day');
    }
  }
);

/**
 * Press Sleep Button: close current day
 */
export const pressSleep = createAsyncThunk(
  'habits/pressSleep',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/habits/days/sleep', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to close day with sleep');
    }
  }
);

/**
 * Record a Habit Hit
 */
export const recordHabitHit = createAsyncThunk(
  'habits/recordHabitHit',
  async ({ habitId, timestamp, notes }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/habits/hits', {
        habitId,
        timestamp: timestamp || new Date().toISOString(),
        notes,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to record habit hit');
    }
  }
);

/**
 * Undo a Habit Hit
 */
export const undoHabitHit = createAsyncThunk(
  'habits/undoHabitHit',
  async (habitId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(`/habits/hits/${habitId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to undo habit hit');
    }
  }
);

/**
 * Fetch Days List (History table data)
 */
export const fetchDaysList = createAsyncThunk(
  'habits/fetchDaysList',
  async (params = { limit: 100 }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/habits/days', { params });
      return response.data.days || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch days list');
    }
  }
);

/**
 * Fetch Overview Analytics & Charts Data
 */
export const fetchOverviewAnalytics = createAsyncThunk(
  'habits/fetchOverviewAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/habits/analytics/overview');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

/**
 * Fetch Deep Dive Analytics for a Single Habit
 */
export const fetchSingleHabitAnalytics = createAsyncThunk(
  'habits/fetchSingleHabitAnalytics',
  async (habitId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/habits/analytics/habit/${habitId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch habit analytics');
    }
  }
);

/**
 * Fetch Sleep Logs
 */
export const fetchSleepLogs = createAsyncThunk(
  'habits/fetchSleepLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/habits/sleep-logs');
      return response.data.logs || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sleep logs');
    }
  }
);

/**
 * Fetch Sleep Analytics & Charts (Night Owl Bedtime, Wake Time, Duration, Quality)
 */
export const fetchSleepAnalytics = createAsyncThunk(
  'habits/fetchSleepAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/habits/sleep-analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sleep analytics');
    }
  }
);

/**
 * Fetch Sleep Records
 */
export const fetchSleepRecords = createAsyncThunk(
  'habits/fetchSleepRecords',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/habits/sleep-records');
      return response.data.records || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sleep records');
    }
  }
);

/**
 * Create a new custom habit
 */
export const createCustomHabit = createAsyncThunk(
  'habits/createCustomHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/habits', habitData);
      return response.data.habit;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create habit');
    }
  }
);

/**
 * Update an existing habit
 */
export const updateCustomHabit = createAsyncThunk(
  'habits/updateCustomHabit',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/habits/${id}`, updates);
      return response.data.habit;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update habit');
    }
  }
);

/**
 * Delete a habit
 */
export const deleteCustomHabit = createAsyncThunk(
  'habits/deleteCustomHabit',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/habits/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete habit');
    }
  }
);

// =========================================================================
// Initial State
// =========================================================================
const initialState = {
  // Habits metadata list
  habits: [],
  habitsLoading: false,

  // Current day tracking status
  isTrackerStarted: false,
  hasActiveDay: false,
  activeDay: null,
  todayHits: [], // Array of HabitHit items for active day
  latestSleepEvent: null,
  lastCompletedDay: null,
  nextDayNumber: 1,
  statusLoading: false,

  // Action loadings
  startingDay: false,
  sleepingDay: false,
  hittingHabitId: null,

  // Days list (Table)
  daysList: [],
  daysLoading: false,

  // Overview analytics
  analyticsMetrics: null,
  analyticsCharts: null,
  analyticsLoading: false,

  // Single habit analytics
  singleHabitData: null,
  singleHabitLoading: false,

  // Sleep event logs
  sleepLogs: [],
  sleepLogsLoading: false,

  // Dedicated Sleep Tracking (Day N Sleep ➔ Day N+1 Wake Up)
  activeSleepRecord: null,
  lastCompletedSleep: null,
  isCurrentlySleeping: false,
  sleepMetrics: null,
  sleepCharts: null,
  sleepRecordsList: [],
  sleepLoading: false,

  // General error
  error: null,
};

// =========================================================================
// Slice Definition
// =========================================================================
const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic or local hit toggle
    optimisticHitUpdate: (state, action) => {
      const { habitId, hit } = action.payload;
      const index = state.todayHits.findIndex((h) => h.habitId === habitId);
      if (index >= 0) {
        state.todayHits[index] = hit;
      } else {
        state.todayHits.push(hit);
      }
    },
  },
  extraReducers: (builder) => {
    // ---------------------------------------------------------------------
    // fetchHabits
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.habitsLoading = true;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.habitsLoading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.habitsLoading = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // fetchCurrentDayStatus
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchCurrentDayStatus.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(fetchCurrentDayStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.isTrackerStarted = action.payload.isTrackerStarted;
        state.hasActiveDay = action.payload.hasActiveDay;
        state.activeDay = action.payload.activeDay;
        state.todayHits = action.payload.hits || [];
        state.latestSleepEvent = action.payload.latestSleepEvent;
        state.lastCompletedDay = action.payload.lastCompletedDay;
        state.nextDayNumber = action.payload.nextDayNumber || (action.payload.lastCompletedDay?.dayNumber || 0) + 1;
        state.activeSleepRecord = action.payload.activeSleepRecord || null;
        state.lastCompletedSleep = action.payload.lastCompletedSleep || null;
        state.isCurrentlySleeping = Boolean(action.payload.isCurrentlySleeping);
      })
      .addCase(fetchCurrentDayStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // startDay
    // ---------------------------------------------------------------------
    builder
      .addCase(startDay.pending, (state) => {
        state.startingDay = true;
      })
      .addCase(startDay.fulfilled, (state, action) => {
        state.startingDay = false;
        state.isTrackerStarted = true;
        state.hasActiveDay = true;
        state.activeDay = action.payload.day;
        state.todayHits = action.payload.hits || [];
        state.isCurrentlySleeping = false;
        state.activeSleepRecord = null;
        if (action.payload.completedSleepRecord) {
          state.lastCompletedSleep = action.payload.completedSleepRecord;
        }
      })
      .addCase(startDay.rejected, (state, action) => {
        state.startingDay = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // pressSleep
    // ---------------------------------------------------------------------
    builder
      .addCase(pressSleep.pending, (state) => {
        state.sleepingDay = true;
      })
      .addCase(pressSleep.fulfilled, (state, action) => {
        state.sleepingDay = false;
        state.hasActiveDay = false;
        state.lastCompletedDay = action.payload.day;
        state.latestSleepEvent = action.payload.sleepEvent;
        state.activeDay = null;
        state.nextDayNumber = (action.payload.day?.dayNumber || 0) + 1;
        state.isCurrentlySleeping = true;
        state.activeSleepRecord = action.payload.sleepRecord || null;
      })
      .addCase(pressSleep.rejected, (state, action) => {
        state.sleepingDay = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // recordHabitHit
    // ---------------------------------------------------------------------
    builder
      .addCase(recordHabitHit.pending, (state, action) => {
        state.hittingHabitId = action.meta.arg.habitId;
      })
      .addCase(recordHabitHit.fulfilled, (state, action) => {
        state.hittingHabitId = null;
        const newHit = action.payload.hit;
        // Update todayHits
        const existingIdx = state.todayHits.findIndex(
          (h) => h.habitId?.toString() === newHit.habitId?.toString()
        );
        if (existingIdx >= 0) {
          state.todayHits[existingIdx] = newHit;
        } else {
          state.todayHits.push(newHit);
        }

        // Update activeDay stats
        if (state.activeDay && action.payload.dayStats) {
          state.activeDay.completedHabitsCount = action.payload.dayStats.completedHabitsCount;
          state.activeDay.completionRate = action.payload.dayStats.completionRate;
        }
      })
      .addCase(recordHabitHit.rejected, (state, action) => {
        state.hittingHabitId = null;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // undoHabitHit
    // ---------------------------------------------------------------------
    builder
      .addCase(undoHabitHit.pending, (state, action) => {
        state.hittingHabitId = action.meta.arg;
      })
      .addCase(undoHabitHit.fulfilled, (state, action) => {
        state.hittingHabitId = null;
        const removedId = action.payload.removedHabitId;
        state.todayHits = state.todayHits.filter(
          (h) => (h.habitId?._id || h.habitId)?.toString() !== removedId.toString()
        );

        if (state.activeDay && action.payload.dayStats) {
          state.activeDay.completedHabitsCount = action.payload.dayStats.completedHabitsCount;
          state.activeDay.completionRate = action.payload.dayStats.completionRate;
        }
      })
      .addCase(undoHabitHit.rejected, (state, action) => {
        state.hittingHabitId = null;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // fetchDaysList
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchDaysList.pending, (state) => {
        state.daysLoading = true;
      })
      .addCase(fetchDaysList.fulfilled, (state, action) => {
        state.daysLoading = false;
        state.daysList = action.payload;
      })
      .addCase(fetchDaysList.rejected, (state, action) => {
        state.daysLoading = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // fetchOverviewAnalytics
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchOverviewAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchOverviewAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsMetrics = action.payload.metrics;
        state.analyticsCharts = action.payload.charts;
        if (action.payload.habitsList) {
          state.habits = action.payload.habitsList;
        }
      })
      .addCase(fetchOverviewAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // fetchSingleHabitAnalytics
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchSingleHabitAnalytics.pending, (state) => {
        state.singleHabitLoading = true;
      })
      .addCase(fetchSingleHabitAnalytics.fulfilled, (state, action) => {
        state.singleHabitLoading = false;
        state.singleHabitData = action.payload;
      })
      .addCase(fetchSingleHabitAnalytics.rejected, (state, action) => {
        state.singleHabitLoading = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // fetchSleepLogs
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchSleepLogs.pending, (state) => {
        state.sleepLogsLoading = true;
      })
      .addCase(fetchSleepLogs.fulfilled, (state, action) => {
        state.sleepLogsLoading = false;
        state.sleepLogs = action.payload;
      })
      .addCase(fetchSleepLogs.rejected, (state, action) => {
        state.sleepLogsLoading = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // fetchSleepAnalytics
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchSleepAnalytics.pending, (state) => {
        state.sleepLoading = true;
      })
      .addCase(fetchSleepAnalytics.fulfilled, (state, action) => {
        state.sleepLoading = false;
        state.sleepMetrics = action.payload.metrics;
        state.sleepCharts = action.payload.charts;
        state.sleepRecordsList = action.payload.records || [];
      })
      .addCase(fetchSleepAnalytics.rejected, (state, action) => {
        state.sleepLoading = false;
        state.error = action.payload;
      });

    // ---------------------------------------------------------------------
    // fetchSleepRecords
    // ---------------------------------------------------------------------
    builder
      .addCase(fetchSleepRecords.fulfilled, (state, action) => {
        state.sleepRecordsList = action.payload;
      });

    // ---------------------------------------------------------------------
    // createCustomHabit
    // ---------------------------------------------------------------------
    builder.addCase(createCustomHabit.fulfilled, (state, action) => {
      state.habits.push(action.payload);
    });

    // ---------------------------------------------------------------------
    // updateCustomHabit
    // ---------------------------------------------------------------------
    builder.addCase(updateCustomHabit.fulfilled, (state, action) => {
      const idx = state.habits.findIndex((h) => h._id === action.payload._id);
      if (idx >= 0) {
        state.habits[idx] = action.payload;
      }
    });

    // ---------------------------------------------------------------------
    // deleteCustomHabit
    // ---------------------------------------------------------------------
    builder.addCase(deleteCustomHabit.fulfilled, (state, action) => {
      state.habits = state.habits.filter((h) => h._id !== action.payload);
    });
  },
});

export const { clearError, optimisticHitUpdate } = habitsSlice.actions;
export default habitsSlice.reducer;

