import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type StockItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestocked: string | null;
  notes: string;
};

type StockState = {
  items: StockItem[];
  loading: boolean;
};

const initialState: StockState = {
  items: [],
  loading: false,
};

const stockSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    setStockItems: (state, action: PayloadAction<StockItem[]>) => {
      state.items = action.payload;
    },
    setStockLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setStockItems, setStockLoading } = stockSlice.actions;
export default stockSlice.reducer;
