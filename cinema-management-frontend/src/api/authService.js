import axiosInstance from './axiosInstance';

const AuthService = {
  // התחברות למערכת
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      if (response.data.token) {
        try {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Error storing auth data in localStorage:', err);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאת התחברות' };
    }
  },

  // יצירת חשבון חדש למשתמש קיים
  createAccount: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/create-account', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה ביצירת חשבון' };
    }
  },

  // התנתקות מהמערכת
  logout: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Error removing auth data from localStorage:', err);
    }
  },

  // קבלת המשתמש הנוכחי מהלוקל סטורג'
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      // ניסיון לנקות את הנתונים הפגומים
      try {
        localStorage.removeItem('user');
      } catch (removeErr) {
        console.error('Error removing corrupted user data:', removeErr);
      }
      return null;
    }
  },

  // בדיקה האם המשתמש מחובר
  isLoggedIn: () => {
    try {
      return !!localStorage.getItem('token');
    } catch (err) {
      console.error('Error checking login status:', err);
      return false;
    }
  },

  // בדיקה האם המשתמש הוא מנהל מערכת
  isAdmin: () => {
    try {
      const user = AuthService.getCurrentUser();
      return user && (user.role === 'ADMIN' || user.permissions?.includes('Manage Users'));
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  },

  // בדיקה האם למשתמש יש הרשאה מסוימת
  hasPermission: (permission) => {
    try {
      const user = AuthService.getCurrentUser();
      return user && user.permissions && user.permissions.includes(permission);
    } catch (err) {
      console.error(`Error checking permission ${permission}:`, err);
      return false;
    }
  }
};

export default AuthService; 