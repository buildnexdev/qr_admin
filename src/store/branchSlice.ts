import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Branch = {
  id: number;
  name: string;
  code: string;
  location: string | null;
  pincode: string | null;
  manager: string | null;
  phone: string | null;
  status: boolean | number;
  staffCount?: number;
};

type BranchState = {
  branches: Branch[];
  loading: boolean;
};

const initialState: BranchState = {
  branches: [],
  loading: false,
};

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    setBranches: (state, action: PayloadAction<Branch[]>) => {
      state.branches = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBranches, setLoading } = branchSlice.actions;
export default branchSlice.reducer;
