import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffApi from '../api/staffApi';
import { getApiErrorMessage } from '../utils/apiError';

export type StaffMember = {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  branch: string;
  qualification?: string;
  address?: string;
  image: string;
  status: boolean;
  employeeId?: string;
  gender?: string;
  dateOfBirth?: string;
  alternatePhone?: string;
  department?: string;
  shiftTiming?: string;
  joiningDate?: string;
  username?: string;
  isPublish?: boolean;
  permissionsJson?: string | null;
  documentsJson?: string | null;
};

type StaffState = {
  staff: StaffMember[];
  loading: boolean;
  currentStaff: StaffMember | null;
  error: string | null;
};

const initialState: StaffState = {
  staff: [],
  loading: false,
  currentStaff: null,
  error: null,
};

export const FetchStaffDetails = createAsyncThunk(
  'staff/FetchStaffDetails',
  async (_, { rejectWithValue }) => {
    try {
      return await staffApi.FetchStaffDetails();
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load staff'));
    }
  }
);

export const GetStaffDetails = createAsyncThunk(
  'staff/GetStaffDetails',
  async (id: number | string, { rejectWithValue }) => {
    try {
      return await staffApi.GetStaffDetails(id);
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to load staff member'));
    }
  }
);

export const AddStaffDetails = createAsyncThunk(
  'staff/AddStaffDetails',
  async (payload: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try {
      const created = await staffApi.AddStaffDetails(payload);
      await dispatch(FetchStaffDetails());
      return created;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to add staff'));
    }
  }
);

export const EditStaffDetails = createAsyncThunk(
  'staff/EditStaffDetails',
  async (
    { id, payload }: { id: number | string; payload: Record<string, unknown> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const updated = await staffApi.EditStaffDetails(id, payload);
      await dispatch(FetchStaffDetails());
      return updated;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to update staff'));
    }
  }
);

export const DeleteStaffDetails = createAsyncThunk(
  'staff/DeleteStaffDetails',
  async (id: number | string, { dispatch, rejectWithValue }) => {
    try {
      await staffApi.DeleteStaffDetails(id);
      await dispatch(FetchStaffDetails());
      return id;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to delete staff'));
    }
  }
);

export const ResetStaffPassword = createAsyncThunk(
  'staff/ResetStaffPassword',
  async ({ id, password }: { id: number | string; password: string }, { rejectWithValue }) => {
    try {
      await staffApi.ResetStaffPassword(id, password);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(getApiErrorMessage(err, 'Failed to reset password'));
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearCurrentStaff: (state) => {
      state.currentStaff = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(FetchStaffDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchStaffDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(FetchStaffDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || null;
      })
      .addCase(GetStaffDetails.fulfilled, (state, action) => {
        state.currentStaff = action.payload;
      })
      .addCase(GetStaffDetails.rejected, (state, action) => {
        state.error = (action.payload as string) || null;
      });
  },
});

export const { clearCurrentStaff } = staffSlice.actions;
export default staffSlice.reducer;
