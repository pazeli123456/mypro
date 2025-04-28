import axiosInstance from './axiosInstance';

const MemberService = {
  // קבלת כל החברים
  getAllMembers: async () => {
    try {
      const response = await axiosInstance.get('/members');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת חברים' };
    }
  },

  // קבלת חבר בודד לפי מזהה
  getMemberById: async (id) => {
    try {
      const response = await axiosInstance.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת החבר' };
    }
  },

  // יצירת חבר חדש
  createMember: async (memberData) => {
    try {
      const response = await axiosInstance.post('/members', memberData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה ביצירת חבר' };
    }
  },

  // עדכון חבר קיים
  updateMember: async (id, memberData) => {
    try {
      const response = await axiosInstance.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה בעדכון החבר' };
    }
  },

  // מחיקת חבר
  deleteMember: async (id) => {
    try {
      const response = await axiosInstance.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה במחיקת החבר' };
    }
  }
};

export default MemberService; 