import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { checkAuthStatus, logout } from '../redux/actions/authActions';
import {
    selectIsAuthenticated,
    selectAuthLoading,
    selectAuthError,
    selectSessionTimeout,
    selectPermissions,
    selectIsAdmin
} from '../redux/reducers/authSlice';

const PUBLIC_ROUTES = ['/', '/login', '/create-account'];

const AppStateManager = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const sessionTimeOut = useSelector(selectSessionTimeout);
    const permissions = useSelector(selectPermissions);
    const isAdmin = useSelector(selectIsAdmin);

    const handleLogout = useCallback(async () => {
        try {
            await dispatch(logout()).unwrap();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [dispatch, navigate]);

    // Authentication check
    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated && !PUBLIC_ROUTES.includes(location.pathname)) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        navigate('/', { replace: true });
                        return;
                    }
                    await dispatch(checkAuthStatus()).unwrap();
                } catch (error) {
                    console.error('Auth check error:', error);
                    localStorage.removeItem('token');
                    navigate('/', { replace: true });
                }
            }
        };

        checkAuth();
    }, [dispatch, navigate, isAuthenticated, location.pathname]);

    // Session timeout handler
    useEffect(() => {
        if (isAuthenticated && sessionTimeOut) {
            const timeoutId = setTimeout(() => {
                handleLogout();
            }, sessionTimeOut * 60 * 1000); // Convert minutes to milliseconds

            return () => clearTimeout(timeoutId);
        }
    }, [sessionTimeOut, handleLogout, isAuthenticated]);

    // Route permissions check
    useEffect(() => {
        if (isAuthenticated && !PUBLIC_ROUTES.includes(location.pathname)) {
            const requiredPermission = getRequiredPermissionForRoute(location.pathname);
            
            if (requiredPermission && !isAdmin && !permissions.includes(requiredPermission)) {
                navigate('/unauthorized', { replace: true });
            }
        }
    }, [isAuthenticated, location.pathname, permissions, isAdmin, navigate]);

    useEffect(() => {
        if (!isAuthenticated && !PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, location.pathname, navigate]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error && !PUBLIC_ROUTES.includes(location.pathname)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-right">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">שגיאה</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        חזרה לדף הראשי
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

// Helper function to determine required permission for each route
const getRequiredPermissionForRoute = (pathname) => {
    if (pathname.startsWith('/movies')) {
        return 'View Movies';
    }
    if (pathname.startsWith('/subscriptions')) {
        return 'View Subscriptions';
    }
    if (pathname.startsWith('/users')) {
        return 'Manage Users';
    }
    return null;
};

export default AppStateManager;