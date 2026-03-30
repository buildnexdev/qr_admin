import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Table {
  id: string;
  name: string;
}

interface TableState {
  tables: Table[];
  loading: boolean;
}

const initialState: TableState = {
  tables: [],
  loading: false,
};

const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables: (state, action: PayloadAction<Table[]>) => {
      state.tables = action.payload;
    },
    addTable: (state, action: PayloadAction<Table>) => {
      state.tables.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setTables, addTable, setLoading } = tableSlice.actions;
export default tableSlice.reducer;
export type { Table };
