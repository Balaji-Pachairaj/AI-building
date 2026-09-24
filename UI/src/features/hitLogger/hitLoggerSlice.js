import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recordHit, recordLogsHit } from '../../api/logApi';

export const sendHitThunk = createAsyncThunk(
  'hitLogger/sendHit',
  async ({ payload, endpointType = 'direct' }, { rejectWithValue }) => {
    try {
      const data = endpointType === 'logs' ? await recordLogsHit(payload) : await recordHit(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send hit');
    }
  }
);

const initialState = {
  sending: false,
  lastResponse: null,
  recentHits: [],
  error: null,
};

export const hitLoggerSlice = createSlice({
  name: 'hitLogger',
  initialState,
  reducers: {
    clearRecentHits: (state) => {
      state.recentHits = [];
      state.lastResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendHitThunk.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendHitThunk.fulfilled, (state, action) => {
        state.sending = false;
        state.lastResponse = action.payload;
        if (action.payload.data) {
          state.recentHits.unshift(action.payload.data);
          // Keep maximum 20 recent hits in memory
          if (state.recentHits.length > 20) {
            state.recentHits.pop();
          }
        }
      })
      .addCase(sendHitThunk.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecentHits } = hitLoggerSlice.actions;

export default hitLoggerSlice.reducer;
