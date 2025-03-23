// src/redux/reducers/authReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { login, logout, checkAuthStatus, createAccount } from '../actions/authActions';
import { TokenManager } from '../../services/apiService';

// פונקציית עזר להבטחת הרשאות בסיסיות
const ensureBasicPermissions = (permissions) => {
    const defaultPermissions = [
        'View Movies',
        'View Members',
        'View Subscriptions'
    ];

    const uniquePermissions = new Set([...permissions, ...defaultPermissions]);
    return Array.from(uniquePermissions);
};

const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetState: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // התחברות
            .addCase('auth/login/pending', (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase('auth/login/fulfilled', (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = {
                    ...action.payload,
                    permissions: ensureBasicPermissions(action.payload.permissions || [])
                };
            })
            .addCase('auth/login/rejected', (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // התנתקות
            .addCase('auth/logout/fulfilled', (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })

            // בדיקת סטטוס אימות
            .addCase('auth/checkAuthStatus/pending', (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase('auth/checkAuthStatus/fulfilled', (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = {
                    ...action.payload,
                    permissions: ensureBasicPermissions(action.payload.permissions || [])
                };
            })
            .addCase('auth/checkAuthStatus/rejected', (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // יצירת חשבון
            .addCase('auth/createAccount/pending', (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase('auth/createAccount/fulfilled', (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = {
                    ...action.payload,
                    permissions: ensureBasicPermissions(action.payload.permissions || [])
                };
            })
            .addCase('auth/createAccount/rejected', (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { resetState } = authSlice.actions;

// סלקטורים
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;