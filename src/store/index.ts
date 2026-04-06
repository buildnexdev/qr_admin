import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import menuReducer from './menuSlice';
import orderReducer from './orderSlice';
import tableReducer from './tableSlice';
import branchReducer from './branchSlice';
import categoryReducer from './categorySlice';
import staffReducer from './staffSlice';
import stockReducer from './stockSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    orders: orderReducer,
    tables: tableReducer,
    branches: branchReducer,
    categories: categoryReducer,
    staff: staffReducer,
    stocks: stockReducer,
  },
});

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  menu: ReturnType<typeof menuReducer>;
  orders: ReturnType<typeof orderReducer>;
  tables: ReturnType<typeof tableReducer>;
  branches: ReturnType<typeof branchReducer>;
  categories: ReturnType<typeof categoryReducer>;
  staff: ReturnType<typeof staffReducer>;
  stocks: ReturnType<typeof stockReducer>;
};

export type AppDispatch = typeof store.dispatch;
