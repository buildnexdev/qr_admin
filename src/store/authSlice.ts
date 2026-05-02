import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../router/const';

// USER INTERFACE
interface User {
  userid: number;
  username: string;
  companyid: number;
  company_name?: string;
  name?: string;
  role?: string | number | null;
  branchid?: number | null;
}

// AUTH SLICE
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

const storedToken = localStorage.getItem('token');
const storedUser = readStoredUser();

// Require both user snapshot and token so the UI does not look "logged in" without credentials.
// Expired tokens stay until the first API 401; axios interceptor then clears session.
const initialState: AuthState = {
  user: storedUser,
  isAuthenticated: !!(storedToken && storedUser),
  status: 'idle',
  error: null,
};

// Async thunk for login API
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { username: string; password?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Login failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Server error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
