import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectPermissions } from '../redux/reducers/authSlice';

const ProtectedRoute = ({ 
    children, 
    requiredPermissions = [], 
    requiredRole = null 
}) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const permissions = useSelector(selectPermissions);
    
    const hasRequiredRole = requiredRole ? user?.role === requiredRole : true;
    
    const hasRequiredPermissions = 
        requiredPermissions.length === 0 || 
        requiredPermissions.some(permission => permissions?.includes(permission)) ||
        (permissions && permissions.includes('Admin'));

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && !hasRequiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (requiredPermissions.length > 0 && !hasRequiredPermissions) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;