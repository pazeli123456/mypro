import { store } from '../redux/store';
import { selectUserPermissions } from '../redux/selectors/userSelectors';
import { AppError } from './errorHandling';

export const PERMISSIONS = {
    // הרשאות משתמשים
    MANAGE_USERS: 'Manage Users',
    VIEW_USERS: 'View Users',
    
    // הרשאות סרטים
    VIEW_MOVIES: 'View Movies',
    CREATE_MOVIES: 'Create Movies',
    UPDATE_MOVIES: 'Update Movies',
    DELETE_MOVIES: 'Delete Movies',
    
    // הרשאות מנויים
    VIEW_SUBSCRIPTIONS: 'View Subscriptions',
    CREATE_SUBSCRIPTIONS: 'Create Subscriptions',
    UPDATE_SUBSCRIPTIONS: 'Update Subscriptions',
    DELETE_SUBSCRIPTIONS: 'Delete Subscriptions',
    
    // הרשאות חברים
    VIEW_MEMBERS: 'View Members',
    CREATE_MEMBERS: 'Create Members',
    UPDATE_MEMBERS: 'Update Members',
    DELETE_MEMBERS: 'Delete Members'
};

export const checkPermission = (requiredPermission) => {
    const state = store.getState();
    const userPermissions = selectUserPermissions(state);
    return userPermissions.includes(requiredPermission);
};

export const checkPermissions = (requiredPermissions) => {
    const state = store.getState();
    const userPermissions = selectUserPermissions(state);
    return requiredPermissions.every(permission => 
        userPermissions.includes(permission)
    );
};

export const requirePermission = (permission) => {
    if (!checkPermission(permission)) {
        throw new AppError('אין הרשאה מתאימה', 'PERMISSION_DENIED');
    }
};

export const requirePermissions = (permissions) => {
    if (!checkPermissions(permissions)) {
        throw new AppError('אין הרשאות מתאימות', 'PERMISSIONS_DENIED');
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('permissions');
};

export const isAuthenticated = () => {
    return Boolean(getToken());
};

export const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};

export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
};

export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    return {
        id: decoded.userId,
        userName: decoded.userName,
        permissions: decoded.permissions || []
    };
};