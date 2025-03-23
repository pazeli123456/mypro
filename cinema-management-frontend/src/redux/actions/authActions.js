// src/redux/actions/authActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/apiService';

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

// התחברות
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.user._id);
            localStorage.setItem('userName', response.user.username);
            localStorage.setItem('permissions', JSON.stringify(response.user.permissions));
            return response.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'שגיאה בהתחברות');
        }
    }
);

// התנתקות
export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('permissions');
    }
);

// בדיקת סטטוס אימות
export const checkAuthStatus = createAsyncThunk(
    'auth/checkAuthStatus',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('אין טוקן שמור');
            }

            const response = await authService.checkAuthStatus();
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.user._id);
            localStorage.setItem('userName', response.user.username);
            localStorage.setItem('permissions', JSON.stringify(response.user.permissions));
            return response.user;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('permissions');
            return rejectWithValue(error.response?.data?.message || 'שגיאה בבדיקת סטטוס אימות');
        }
    }
);

// יצירת חשבון
export const createAccount = createAsyncThunk(
    'auth/createAccount',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.createAccount(userData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.user._id);
            localStorage.setItem('userName', response.user.username);
            localStorage.setItem('permissions', JSON.stringify(response.user.permissions));
            return response.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'שגיאה ביצירת חשבון');
        }
    }
);