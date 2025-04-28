import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthService from '../api/authService';

const ProtectedRoute = ({ requiredPermission, adminOnly = false }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  
  // בדיקה האם המשתמש מחובר
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  // בדיקת הרשאות בצורה עמידה לשגיאות
  try {
    // בדיקת הרשאת מנהל אם נדרש
    if (adminOnly) {
      const isAdmin = AuthService.isAdmin();
      if (!isAdmin) {
        return <Navigate to="/main" />;
      }
    }
    
    // בדיקת הרשאה ספציפית אם נדרש
    if (requiredPermission) {
      const hasPermission = AuthService.hasPermission(requiredPermission);
      if (!hasPermission) {
        return <Navigate to="/main" />;
      }
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
    // אם יש שגיאה בבדיקת ההרשאות, ננתב בחזרה לדף ההתחברות
    return <Navigate to="/login" />;
  }
  
  // המשתמש עבר את כל הבדיקות - אפשר להציג את התוכן
  return <Outlet />;
};

export default ProtectedRoute; 