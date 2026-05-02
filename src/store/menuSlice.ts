import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as menuApi from '../api/menuApi';
import type { MenuItemDto } from '../api/menuApi';
import { getApiErrorMessage } from '../utils/apiError';

export type FoodItem = MenuItemDto;

type MenuState = {
  items: FoodItem[];
  loading: boolean;
  error: string | null;
  /** Last item loaded by getMenu (detail / edit prefetch) */
  currentItem: FoodItem | null;
};

const initialState: MenuState = {
  items: [],
  loading: false,
  error: null,
  currentItem: null,
};

/** Load full menu list */
export const fetchMenu = createAsyncThunk('menu/fetchMenu', async (_, { rejectWithValue }) => {
  try {
    return await menuApi.fetchMenu();
  } catch (err: unknown) {
    return rejectWithValue(getApiErrorMessage(err, 'Failed to load menu'));
  }
});

/** Load one item by id */
export const getMenu = createAsyncThunk(
  'menu/getMenu',
  async (id: number | string, { rejectWithValue }) => {
    try {
      return await menuApi.getMenu(id);
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load menu item'));
    }
  }
);

export const addMenu = createAsyncThunk(
  'menu/addMenu',
  async (payload: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try {
      const created = await menuApi.addMenu(payload);
      await dispatch(fetchMenu());
      return created;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to add menu item'));
    }
  }
);

export const editMenu = createAsyncThunk(
  'menu/editMenu',
  async (
    { id, payload }: { id: number | string; payload: Record<string, unknown> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await menuApi.editMenu(id, payload);
      await dispatch(fetchMenu());
      return updated;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update menu item'));
    }
  }
);

export const deleteMenu = createAsyncThunk(
  'menu/deleteMenu',
  async (id: number | string, { dispatch, rejectWithValue }) => {
    try {
      await menuApi.deleteMenu(id);
      await dispatch(fetchMenu());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to delete menu item'));
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearMenuError: (state) => {
      state.error = null;
    },
    clearCurrentMenuItem: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || null;
      })
      .addCase(getMenu.fulfilled, (state, action) => {
        state.currentItem = action.payload;
      })
      .addCase(getMenu.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      })
      .addCase(addMenu.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      })
      .addCase(editMenu.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      });
  },
});

export const { clearMenuError, clearCurrentMenuItem } = menuSlice.actions;
export default menuSlice.reducer;
