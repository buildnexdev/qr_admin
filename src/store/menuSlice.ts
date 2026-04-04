import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FoodItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  rate?: number;
  status?: boolean;
}

interface MenuState {
  items: FoodItem[];
  loading: boolean;
}

const initialState: MenuState = {
  items: [],
  loading: false,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action: PayloadAction<FoodItem[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setMenuItems, setLoading } = menuSlice.actions;
export default menuSlice.reducer;
export type { FoodItem };
