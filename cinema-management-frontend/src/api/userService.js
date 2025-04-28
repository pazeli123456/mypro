import axiosInstance from './axiosInstance';

const UserService = {
  // קבלת כל המשתמשים - נגיש רק למנהל מערכת
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      console.error('שגיאה בקבלת כל המשתמשים:', error);
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת משתמשים' };
    }
  },

  // קבלת משתמש לפי מזהה
  getUserById: async (id) => {
    try {
      if (!id) {
        throw new Error('מזהה משתמש לא הוגדר');
      }
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בקבלת משתמש ${id}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת המשתמש' };
    }
  },

  // יצירת משתמש חדש - נגיש רק למנהל מערכת
  createUser: async (userData) => {
    try {
      // בדיקה שכל הנתונים הנדרשים קיימים
      if (!userData.userName || !userData.password || !userData.email) {
        throw new Error('Username, email, and password are required');
      }
      
      const response = await axiosInstance.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('שגיאה ביצירת משתמש:', error);
      throw error.response ? error.response.data : { error: error.message || 'שגיאה ביצירת משתמש' };
    }
  },

  // עדכון משתמש קיים
  updateUser: async (id, userData) => {
    try {
      if (!id) {
        throw new Error('מזהה משתמש לא הוגדר');
      }
      const response = await axiosInstance.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בעדכון משתמש ${id}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה בעדכון המשתמש' };
    }
  },

  // מחיקת משתמש
  deleteUser: async (id) => {
    try {
      if (!id) {
        throw new Error('מזהה משתמש לא הוגדר');
      }
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה במחיקת משתמש ${id}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה במחיקת המשתמש' };
    }
  },

  // קבלת הרשאות של משתמש
  getUserPermissions: async (id) => {
    try {
      if (!id) {
        throw new Error('מזהה משתמש לא הוגדר');
      }
      const response = await axiosInstance.get(`/permissions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בקבלת הרשאות משתמש ${id}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת הרשאות המשתמש' };
    }
  },

  // עדכון הרשאות של משתמש
  updateUserPermissions: async (id, permissions) => {
    try {
      if (!id) {
        throw new Error('מזהה משתמש לא הוגדר');
      }
      const response = await axiosInstance.put(`/permissions/${id}`, { permissions });
      return response.data;
    } catch (error) {
      console.error(`שגיאה בעדכון הרשאות משתמש ${id}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה בעדכון הרשאות המשתמש' };
    }
  }
};

export default UserService; 