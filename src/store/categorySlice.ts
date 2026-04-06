import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type MenuCategory = {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  displayOrder: string;
  itemsCount: number;
  status: boolean;
  tags: string[];
};

type CategoryState = {
  categories: MenuCategory[];
  loading: boolean;
};

const initialState: CategoryState = {
  categories: [],
  loading: false,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<MenuCategory[]>) => {
      state.categories = action.payload;
    },
    setCategoriesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCategories, setCategoriesLoading } = categorySlice.actions;
export default categorySlice.reducer;
