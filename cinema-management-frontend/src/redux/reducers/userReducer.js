// src/redux/reducers/userReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { login, logout, checkAuthStatus } from '../actions/authActions';

const initialState = {
    currentUser: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'שגיאה בהתחברות';
        });

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.currentUser = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token'); // נוסיף ניקוי של הטוקן מה-localStorage
        });

        // Check Auth Status
        builder.addCase(checkAuthStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
            state.token = action.payload.token;
            state.error = null;
        });
        builder.addCase(checkAuthStatus.rejected, (state, action) => {
            state.loading = false;
            state.currentUser = null;
            state.token = null;
            state.error = action.payload;
        });
    }
});

// Selectors
export const selectUser = (state) => state.user.currentUser;
export const selectIsAuthenticated = (state) => Boolean(state.user.token);
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

export const { clearError } = userSlice.actions;
export { logout } from '../actions/authActions'; // נייצא את פעולת ה-logout ישירות

export default userSlice.reducer;