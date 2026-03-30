import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: number;
  customerName: string;
  tableId: string;
  items: any[];
  total: number;
  status: string;
  timestamp: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setOrders, setLoading } = orderSlice.actions;
export default orderSlice.reducer;
export type { Order };
