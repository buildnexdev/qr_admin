import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as companyApi from '../api/companyApi';
import { getApiErrorMessage } from '../utils/apiError';

type CompanyState = {
  companies: unknown[];
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
};

const initialState: CompanyState = {
  companies: [],
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      return await companyApi.fetchCompanies();
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load companies'));
    }
  }
);

export const fetchCompanyDetails = createAsyncThunk(
  'company/fetchCompanyDetails',
  async (id: string | number, { rejectWithValue }) => {
    try {
      return await companyApi.fetchCompanyDetails(id);
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load company'));
    }
  }
);

export const addCompany = createAsyncThunk(
  'company/addCompany',
  async (payload: unknown, { dispatch, rejectWithValue }) => {
    try {
      const created = await companyApi.addCompany(payload);
      await dispatch(fetchCompanies());
      return created;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to create company'));
    }
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async (
    { id, payload }: { id: string | number; payload: unknown },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await companyApi.updateCompany(id, payload);
      await dispatch(fetchCompanies());
      return res;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update company'));
    }
  }
);

export const setCompanyActive = createAsyncThunk(
  'company/setCompanyActive',
  async (
    { id, isActive }: { id: string | number; isActive: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await companyApi.setCompanyActive(id, isActive);
      await dispatch(fetchCompanies());
      return { id, isActive };
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update company status'));
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload as unknown[];
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load companies';
      })
      .addCase(fetchCompanyDetails.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyDetails.fulfilled, (state) => {
        state.detailLoading = false;
      })
      .addCase(fetchCompanyDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = (action.payload as string) || 'Failed to load company';
      });
  },
});

export default companySlice.reducer;
