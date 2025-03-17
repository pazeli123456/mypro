// src/redux/reducers/authReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { login, logout, checkAuthStatus, createAccount } from '../actions/authActions';
import { TokenManager } from '../../services/apiService';

// פונקציית עזר - הוספת הרשאות בסיסיות אם חסרות
const ensureBasicPermissions = (permissions = []) => {
    const defaultPermissions = [
        'View Movies',
        'Create Movies',
        'Delete Movies',
        'Update Movies',
        'View Subscriptions',
        'Create Subscriptions',
        'Delete Subscriptions',
        'Update Subscriptions',
        'View Members',
        'Create Members',
        'Update Members',
        'Delete Members'
    ];
    
    const updatedPermissions = [...permissions];
    
    defaultPermissions.forEach(permission => {
        if (!updatedPermissions.includes(permission)) {
            updatedPermissions.push(permission);
        }
    });
    
    return updatedPermissions;
};

const initialState = {
    user: TokenManager.getCurrentUser(),
    token: TokenManager.getToken(),
    permissions: ensureBasicPermissions(TokenManager.getCurrentUser()?.permissions),
    isAuthenticated: TokenManager.isAuthenticated(),
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: () => {
            TokenManager.clearUserData();
            return initialState;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.permissions = ensureBasicPermissions(action.payload.permissions);
            state.isAuthenticated = true;
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
            
            // וודא שיש הרשאות בסיסיות
            const enhancedPermissions = ensureBasicPermissions(action.payload.permissions);
            
            state.user = {
                id: action.payload.id,
                userName: action.payload.userName,
                firstName: action.payload.firstName || '',
                lastName: action.payload.lastName || '',
                permissions: enhancedPermissions,
                sessionTimeOut: action.payload.sessionTimeOut
            };
            state.token = action.payload.token;
            state.permissions = enhancedPermissions;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'שגיאת התחברות';
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.permissions = [];
        });

        // Logout
        builder.addCase(logout.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(logout.fulfilled, (state) => {
            TokenManager.clearUserData();
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.permissions = [];
            state.loading = false;
        });
        builder.addCase(logout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            // עדיין נקה את הנתונים גם אם התנתקות נכשלה
            TokenManager.clearUserData();
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.permissions = [];
        });

        // Check Auth Status
        builder.addCase(checkAuthStatus.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(checkAuthStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            
            // וודא שיש הרשאות בסיסיות
            const enhancedPermissions = ensureBasicPermissions(action.payload.permissions);
            
            state.user = {
                id: action.payload.userId,
                userName: action.payload.userName,
                firstName: action.payload.firstName || '',
                lastName: action.payload.lastName || '',
                permissions: enhancedPermissions,
                sessionTimeOut: action.payload.sessionTimeOut
            };
            state.token = action.payload.token;
            state.permissions = enhancedPermissions;
        });
        builder.addCase(checkAuthStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.permissions = [];
            TokenManager.clearUserData();
        });

        // Create Account
        builder.addCase(createAccount.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createAccount.fulfilled, (state) => {
            state.loading = false;
            // לא להתחבר אוטומטית אחרי יצירת חשבון
        });
        builder.addCase(createAccount.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

// Selectors
export const selectCurrentUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;
export const selectPermissions = state => state.auth.permissions;
export const selectToken = state => state.auth.token;
export const selectIsAdmin = state => state.auth.permissions?.includes('Manage Users') || false;

export const { clearError, resetAuth, setUser } = authSlice.actions;

export default authSlice.reducer;