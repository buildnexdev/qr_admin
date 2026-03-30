import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import menuReducer from './menuSlice';
import orderReducer from './orderSlice';
import tableReducer from './tableSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    orders: orderReducer,
    tables: tableReducer,
  },
});

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  menu: ReturnType<typeof menuReducer>;
  orders: ReturnType<typeof orderReducer>;
  tables: ReturnType<typeof tableReducer>;
};

export type AppDispatch = typeof store.dispatch;
