import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectCurrentUser } from '../redux/reducers/authReducer';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const permissions = user?.permissions || [];

    // אם המשתמש לא מחובר, הפנה אותו לדף ההתחברות
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // בדוק אם למשתמש יש את כל ההרשאות הנדרשות
    const hasRequiredPermissions = requiredPermissions.every(permission =>
        permissions.includes(permission)
    );

    // אם אין למשתמש את ההרשאות הנדרשות, הפנה אותו לדף הראשי
    if (!hasRequiredPermissions) {
        return <Navigate to="/" replace />;
    }

    // אם יש למשתמש את כל ההרשאות הנדרשות, הצג את התוכן
    return children;
};

export default ProtectedRoute;