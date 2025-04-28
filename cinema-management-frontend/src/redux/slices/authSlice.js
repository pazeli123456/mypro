import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../api/authService';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await AuthService.login(credentials);
    } catch (error) {
      return rejectWithValue(error.error || 'התחברות נכשלה');
    }
  }
);

export const createAccount = createAsyncThunk(
  'auth/createAccount',
  async (userData, { rejectWithValue }) => {
    try {
      return await AuthService.createAccount(userData);
    } catch (error) {
      return rejectWithValue(error.error || 'יצירת חשבון נכשלה');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    AuthService.logout();
    return null;
  }
);

// Initial state - ללא קריאות ישירות לפונקציות שעלולות לגרום לשגיאה
const initialState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      try {
        const userFromStorage = AuthService.getCurrentUser();
        const isUserLoggedIn = AuthService.isLoggedIn();
        state.user = userFromStorage;
        state.isLoggedIn = isUserLoggedIn;
      } catch (error) {
        console.error('Error initializing auth state:', error);
        state.user = null;
        state.isLoggedIn = false;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Account
      .addCase(createAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
      });
  }
});

export const { clearError, initializeAuth } = authSlice.actions;

export default authSlice.reducer; 