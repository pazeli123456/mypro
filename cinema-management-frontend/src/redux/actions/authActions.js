// src/redux/actions/authActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService, TokenManager } from '../../services/apiService';

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

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials.userName, credentials.password);
            
            if (!response || !response.token) {
                throw new Error('תגובה לא תקינה מהשרת');
            }

            // וודא שיש הרשאות בסיסיות
            const enhancedPermissions = ensureBasicPermissions(response.permissions || []);

            const userData = {
                userId: response.id || response.userId,
                userName: response.userName,
                firstName: response.firstName || '',
                lastName: response.lastName || '',
                permissions: enhancedPermissions,
                token: response.token,
                sessionTimeOut: response.sessionTimeOut || 60,
                isAdmin: enhancedPermissions.includes('Manage Users') || false
            };

            TokenManager.setToken(userData.token);
            TokenManager.setUserData({...userData, permissions: enhancedPermissions});

            return userData;

        } catch (error) {
            console.error('Login error:', error);
            TokenManager.clearUserData();
            return rejectWithValue(error.message || 'שם משתמש או סיסמה שגויים');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await authService.logout();
            TokenManager.clearUserData();
            
            // אפס את המצב הכללי של האפליקציה
            dispatch({ type: 'RESET_APP_STATE' });
            
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            // גם במקרה של שגיאה, עדיין נקה את המידע המקומי
            TokenManager.clearUserData();
            dispatch({ type: 'RESET_APP_STATE' });
            return rejectWithValue(error.message || 'שגיאה בהתנתקות');
        }
    }
);

export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        try {
            const token = TokenManager.getToken();
            if (!token) {
                return rejectWithValue('לא נמצא טוקן');
            }

            const response = await authService.checkAuthStatus();
            
            if (!response) {
                return rejectWithValue('תגובה לא תקינה מהשרת');
            }

            // וודא שיש הרשאות בסיסיות
            const enhancedPermissions = ensureBasicPermissions(response.permissions || []);

            return {
                userId: response.id || response.userId,
                userName: response.userName,
                firstName: response.firstName || '',
                lastName: response.lastName || '',
                permissions: enhancedPermissions,
                token: response.token || token,
                sessionTimeOut: response.sessionTimeOut || 60,
                isAdmin: enhancedPermissions.includes('Manage Users') || false
            };

        } catch (error) {
            console.error('Auth check error:', error);
            TokenManager.clearUserData();
            return rejectWithValue(error.message || 'בדיקת אימות נכשלה');
        }
    }
);

export const createAccount = createAsyncThunk(
    'auth/createAccount',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.createAccount(userData);
            
            if (!response) {
                throw new Error('תגובה לא תקינה מהשרת');
            }

            return response;
        } catch (error) {
            console.error('Create account error:', error);
            return rejectWithValue(error.message || 'שגיאה ביצירת החשבון');
        }
    }
);