import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import MovieService from '../../api/movieService';

// Async thunks
export const fetchAllMovies = createAsyncThunk(
  'movies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await MovieService.getAllMovies();
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת סרטים נכשלה');
    }
  }
);

export const fetchMovieById = createAsyncThunk(
  'movies/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await MovieService.getMovieById(id);
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת סרט נכשלה');
    }
  }
);

export const createMovie = createAsyncThunk(
  'movies/create',
  async (movieData, { rejectWithValue }) => {
    try {
      return await MovieService.createMovie(movieData);
    } catch (error) {
      return rejectWithValue(error.error || 'יצירת סרט נכשלה');
    }
  }
);

export const updateMovie = createAsyncThunk(
  'movies/update',
  async ({ id, movieData }, { rejectWithValue }) => {
    try {
      return await MovieService.updateMovie(id, movieData);
    } catch (error) {
      return rejectWithValue(error.error || 'עדכון סרט נכשל');
    }
  }
);

export const deleteMovie = createAsyncThunk(
  'movies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await MovieService.deleteMovie(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.error || 'מחיקת סרט נכשלה');
    }
  }
);

export const searchMovies = createAsyncThunk(
  'movies/search',
  async (query, { rejectWithValue }) => {
    try {
      return await MovieService.searchMovies(query);
    } catch (error) {
      return rejectWithValue(error.error || 'חיפוש סרטים נכשל');
    }
  }
);

export const fetchMoviesFromAPI = createAsyncThunk(
  'movies/fetchFromAPI',
  async (_, { rejectWithValue }) => {
    try {
      return await MovieService.fetchMoviesFromAPI();
    } catch (error) {
      return rejectWithValue(error.error || 'משיכת סרטים מה-API נכשלה');
    }
  }
);

// Initial state
const initialState = {
  movies: [],
  currentMovie: null,
  isLoading: false,
  error: null
};

// Slice
const movieSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all movies
      .addCase(fetchAllMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movies = action.payload;
      })
      .addCase(fetchAllMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch movie by ID
      .addCase(fetchMovieById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create movie
      .addCase(createMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movies.push(action.payload);
      })
      .addCase(createMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update movie
      .addCase(updateMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMovie = action.payload;
        const index = state.movies.findIndex(movie => movie._id === action.payload._id);
        if (index !== -1) {
          state.movies[index] = action.payload;
        }
      })
      .addCase(updateMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete movie
      .addCase(deleteMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movies = state.movies.filter(movie => movie._id !== action.payload);
        if (state.currentMovie && state.currentMovie._id === action.payload) {
          state.currentMovie = null;
        }
      })
      .addCase(deleteMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Search movies
      .addCase(searchMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movies = action.payload;
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch movies from API
      .addCase(fetchMoviesFromAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMoviesFromAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movies = action.payload;
      })
      .addCase(fetchMoviesFromAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentMovie } = movieSlice.actions;

export default movieSlice.reducer; 