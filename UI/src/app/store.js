import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { injectStoreDispatch } from '../api/axiosClient';

/**
 * Configure Redux Toolkit Store
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows flexible Date / response objects
    }),
  devTools: import.meta.env.DEV,
});

// Bridge Axios interceptors to Redux dispatch for automatic error toasts
injectStoreDispatch(store.dispatch);

export default store;
