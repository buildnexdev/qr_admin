import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryApi from '../api/categoryApi';
import type { CategoryDto } from '../api/categoryApi';
import { getApiErrorMessage } from '../utils/apiError';

export type MenuCategory = CategoryDto;

type CategoryState = {
  categories: MenuCategory[];
  loading: boolean;
  error: string | null;
};

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { rejectWithValue }) => {
  try {
    return await categoryApi.fetchCategories();
  } catch (err: unknown) {
    return rejectWithValue(getApiErrorMessage(err, 'Failed to load categories'));
  }
});

export const addCategory = createAsyncThunk(
  'categories/add',
  async (payload: { name: string; description?: string }, { dispatch, rejectWithValue }) => {
    try {
      const created = await categoryApi.addCategory(payload);
      await dispatch(fetchCategories());
      return created;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to add category'));
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async (
    { id, payload }: { id: number | string; payload: { name: string; description?: string } },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const row = await categoryApi.editCategory(id, payload);
      await dispatch(fetchCategories());
      return row;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update category'));
    }
  }
);

export const setCategoryActive = createAsyncThunk(
  'categories/setActive',
  async ({ id, isActive }: { id: number | string; isActive: boolean }, { dispatch, rejectWithValue }) => {
    try {
      const row = await categoryApi.setCategoryActive(id, isActive);
      await dispatch(fetchCategories());
      return row;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update status'));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number | string, { dispatch, rejectWithValue }) => {
    try {
      await categoryApi.deleteCategory(id);
      await dispatch(fetchCategories());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to delete category'));
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || null;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      })
      .addCase(setCategoryActive.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
