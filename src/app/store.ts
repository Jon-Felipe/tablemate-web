import { configureStore } from '@reduxjs/toolkit';

// extras
import authReducer from '../features/auth/authSlice';
import { restaurantApi } from '../services/restaurantApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [restaurantApi.reducerPath]: restaurantApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(restaurantApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
