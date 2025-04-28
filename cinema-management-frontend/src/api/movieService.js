import axiosInstance from './axiosInstance';

const MovieService = {
  // קבלת כל הסרטים
  getAllMovies: async () => {
    try {
      const response = await axiosInstance.get('/movies');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת סרטים' };
    }
  },

  // קבלת סרט בודד לפי מזהה
  getMovieById: async (id) => {
    try {
      const response = await axiosInstance.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה בטעינת הסרט' };
    }
  },

  // יצירת סרט חדש
  createMovie: async (movieData) => {
    try {
      const response = await axiosInstance.post('/movies', movieData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה ביצירת סרט' };
    }
  },

  // עדכון סרט קיים
  updateMovie: async (id, movieData) => {
    try {
      const response = await axiosInstance.put(`/movies/${id}`, movieData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה בעדכון הסרט' };
    }
  },

  // מחיקת סרט
  deleteMovie: async (id) => {
    try {
      const response = await axiosInstance.delete(`/movies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה במחיקת הסרט' };
    }
  },

  // חיפוש סרטים לפי שם
  searchMovies: async (query) => {
    try {
      const response = await axiosInstance.get(`/movies?name=${query}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה בחיפוש סרטים' };
    }
  },

  // משיכת סרטים מ-API חיצוני ושמירה ב-DB
  fetchMoviesFromAPI: async () => {
    try {
      const response = await axiosInstance.post('/movies/fetch-movies');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { error: 'שגיאה במשיכת סרטים מה-API' };
    }
  }
};

export default MovieService; 