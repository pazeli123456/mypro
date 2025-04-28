import axiosInstance from './axiosInstance';

const SubscriptionService = {
  // קבלת כל המנויים
  getAllSubscriptions: async () => {
    try {
      const response = await axiosInstance.get('/subscriptions');
      return response.data;
    } catch (error) {
      console.error('שגיאה בקבלת מנויים:', error);
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת מנויים' };
    }
  },

  // קבלת מנויים של חבר ספציפי
  getMemberSubscriptions: async (memberId) => {
    try {
      if (!memberId) {
        throw new Error('מזהה חבר לא הוגדר');
      }
      const response = await axiosInstance.get(`/subscriptions?memberId=${memberId}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בקבלת מנויים עבור חבר ${memberId}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת מנויים של החבר' };
    }
  },

  // הוספת צפייה בסרט לחבר
  addMovieToMember: async (subscriptionData) => {
    try {
      // בדיקה שכל הנתונים הנדרשים קיימים
      if (!subscriptionData.memberId || !subscriptionData.movies || !subscriptionData.movies.length) {
        throw new Error('Member ID and movies array are required');
      }
      
      // בדיקה שכל סרט מכיל מזהה ותאריך
      for (const movie of subscriptionData.movies) {
        if (!movie.movieId || !movie.date) {
          throw new Error('כל סרט חייב לכלול מזהה ותאריך צפייה');
        }
      }
      
      const response = await axiosInstance.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('שגיאה בהוספת צפייה בסרט:', error);
      throw error.response ? error.response.data : { error: error.message || 'שגיאה בהוספת צפייה בסרט' };
    }
  },

  // קבלת רשימת הסרטים שחבר צפה בהם
  getMemberWatchedMovies: async (memberId) => {
    try {
      if (!memberId) {
        throw new Error('מזהה חבר לא הוגדר');
      }
      const response = await axiosInstance.get(`/subscriptions/${memberId}/movies`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בקבלת סרטים שנצפו עבור חבר ${memberId}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת רשימת הסרטים שנצפו' };
    }
  },

  // קבלת רשימת החברים שצפו בסרט מסוים
  getMovieWatchers: async (movieId) => {
    try {
      if (!movieId) {
        throw new Error('מזהה סרט לא הוגדר');
      }
      const response = await axiosInstance.get(`/subscriptions/movies/${movieId}/watchers`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה בקבלת צופים בסרט ${movieId}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת רשימת הצופים בסרט' };
    }
  },

  // מחיקת מנוי
  deleteSubscription: async (id) => {
    try {
      if (!id) {
        throw new Error('מזהה מנוי לא הוגדר');
      }
      const response = await axiosInstance.delete(`/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`שגיאה במחיקת מנוי ${id}:`, error);
      throw error.response ? error.response.data : { error: 'שגיאה במחיקת המנוי' };
    }
  }
};

export default SubscriptionService; 