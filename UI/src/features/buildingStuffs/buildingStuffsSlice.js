import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchBuildingStuffs,
  fetchBuildingStuffById,
  createBuildingStuff,
  hitBuildingStuff,
} from '../../api/buildingStuffsApi';

export const getBuildingStuffsThunk = createAsyncThunk(
  'buildingStuffs/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchBuildingStuffs();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch building stuffs');
    }
  }
);

export const getBuildingStuffByIdThunk = createAsyncThunk(
  'buildingStuffs/getById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchBuildingStuffById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch item');
    }
  }
);

export const createBuildingStuffThunk = createAsyncThunk(
  'buildingStuffs/create',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createBuildingStuff(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create building stuff');
    }
  }
);

export const hitBuildingStuffThunk = createAsyncThunk(
  'buildingStuffs/hit',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await hitBuildingStuff(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to hit building stuff');
    }
  }
);

const initialState = {
  items: [],
  activeItem: null,
  loading: false,
  submitting: false,
  hitting: false,
  lastHitResult: null,
  error: null,
};

export const buildingStuffsSlice = createSlice({
  name: 'buildingStuffs',
  initialState,
  reducers: {
    clearActiveItem: (state) => {
      state.activeItem = null;
    },
    clearLastHitResult: (state) => {
      state.lastHitResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAll
      .addCase(getBuildingStuffsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBuildingStuffsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
      })
      .addCase(getBuildingStuffsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getById
      .addCase(getBuildingStuffByIdThunk.fulfilled, (state, action) => {
        state.activeItem = action.payload.data;
      })
      // create
      .addCase(createBuildingStuffThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createBuildingStuffThunk.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload.data) {
          state.items.push(action.payload.data);
        }
      })
      .addCase(createBuildingStuffThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // hit
      .addCase(hitBuildingStuffThunk.pending, (state) => {
        state.hitting = true;
      })
      .addCase(hitBuildingStuffThunk.fulfilled, (state, action) => {
        state.hitting = false;
        state.lastHitResult = action.payload;
      })
      .addCase(hitBuildingStuffThunk.rejected, (state, action) => {
        state.hitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearActiveItem, clearLastHitResult } = buildingStuffsSlice.actions;

export default buildingStuffsSlice.reducer;
