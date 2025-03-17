// src/redux/reducers/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { login, logout, checkAuthStatus } from '../actions/authActions';

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    sessionTimeOut: null,
    isAdmin: false,
    permissions: []
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSessionTimeout: (state, action) => {
            state.sessionTimeOut = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.sessionTimeOut = null;
            state.isAdmin = false;
            state.permissions = [];
            localStorage.removeItem('token');
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
            state.isAuthenticated = true;
            state.user = {
                id: action.payload.userId,
                userName: action.payload.userName,
                firstName: action.payload.firstName || '',
                lastName: action.payload.lastName || '',
                permissions: action.payload.permissions || []
            };
            state.token = action.payload.token;
            state.sessionTimeOut = action.payload.sessionTimeOut || 60;
            state.isAdmin = action.payload.permissions?.includes('Manage Users') || false;
            state.permissions = action.payload.permissions || [];
            localStorage.setItem('token', action.payload.token);
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'שגיאה בהתחברות';
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.isAdmin = false;
            state.permissions = [];
            localStorage.removeItem('token');
        });

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.sessionTimeOut = null;
            state.isAdmin = false;
            state.permissions = [];
            localStorage.removeItem('token');
        });

        // Check Auth Status
        builder.addCase(checkAuthStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = {
                id: action.payload.userId,
                userName: action.payload.userName,
                firstName: action.payload.firstName || '',
                lastName: action.payload.lastName || '',
                permissions: action.payload.permissions || []
            };
            state.sessionTimeOut = action.payload.sessionTimeOut || 60;
            state.isAdmin = action.payload.permissions?.includes('Manage Users') || false;
            state.permissions = action.payload.permissions || [];
            state.token = action.payload.token;
        });
        builder.addCase(checkAuthStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'אימות משתמש נכשל';
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.isAdmin = false;
            state.permissions = [];
            localStorage.removeItem('token');
        });
    }
});

export const { clearError, setSessionTimeout, setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.isAdmin;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUser = (state) => state.auth.user;
export const selectSessionTimeout = (state) => state.auth.sessionTimeOut;
export const selectPermissions = (state) => state.auth.permissions;

// Permission check helper
export const hasPermission = (state, permission) => {
    return state.auth.permissions?.includes(permission) || state.auth.isAdmin;
};