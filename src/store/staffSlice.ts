import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
};

type StaffState = {
  staff: StaffMember[];
  loading: boolean;
};

const initialState: StaffState = {
  staff: [],
  loading: false,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setStaff: (state, action: PayloadAction<StaffMember[]>) => {
      state.staff = action.payload;
    },
    setStaffLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setStaff, setStaffLoading } = staffSlice.actions;
export default staffSlice.reducer;
