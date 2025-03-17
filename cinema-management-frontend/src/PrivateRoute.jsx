import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectPermissions } from '../redux/reducers/authReducer';

const PrivateRoute = ({ children, requiredPermissions = [] }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const permissions = useSelector(selectPermissions);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />; // Changed redirect path to "/login"
    }

    if (requiredPermissions.length > 0 && 
        !requiredPermissions.every(permission => permissions.includes(permission))) {
        return <Navigate to="/unauthorized" replace />; // Changed redirect path to "/unauthorized"
    }

    return children;
};

export default PrivateRoute;