import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
      state.notifications.push({
        id,
        type: action.payload.type || 'info', // 'success' | 'error' | 'warning' | 'info'
        title: action.payload.title || '',
        message: action.payload.message || '',
        duration: action.payload.duration || 5000,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
