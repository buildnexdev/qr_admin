import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as branchApi from '../api/branchApi';
import { getApiErrorMessage } from '../utils/apiError';

type BranchState = {
  branches: any[];
  loading: boolean;
  currentBranch: any | null;
  error: string | null;
};

const initialState: BranchState = {
  branches: [],
  loading: false,
  currentBranch: null,
  error: null,
};

export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      return await branchApi.fetchBranches();
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load branches'));
    }
  }
);

export const getBranch = createAsyncThunk(
  'branches/getBranch',
  async (id: string | number, { rejectWithValue }) => {
    try {
      return await branchApi.getBranch(id);
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load branch'));
    }
  }
);

export const addBranch = createAsyncThunk(
  'branches/addBranch',
  async (payload: unknown, { dispatch, rejectWithValue }) => {
    try {
      const created = await branchApi.addBranch(payload);
      await dispatch(fetchBranches());
      return created;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to save branch'));
    }
  }
);

export const editBranch = createAsyncThunk(
  'branches/editBranch',
  async (
    { id, payload }: { id: string | number; payload: unknown },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await branchApi.editBranch(id, payload);
      await dispatch(fetchBranches());
      return updated;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to save branch'));
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branches/deleteBranch',
  async (id: string | number, { dispatch, rejectWithValue }) => {
    try {
      await branchApi.deleteBranch(id);
      await dispatch(fetchBranches());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to delete branch'));
    }
  }
);

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearCurrentBranch: (state) => {
      state.currentBranch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load branches';
      })
      .addCase(getBranch.fulfilled, (state, action) => {
        state.currentBranch = action.payload;
      })
      .addCase(getBranch.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      });
  },
});

export const { clearCurrentBranch } = branchSlice.actions;
export default branchSlice.reducer;
