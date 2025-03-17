// src/redux/reducers/movieReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { 
    fetchAllMovies, 
    createMovie, 
    editMovie, 
    removeMovie 
} from '../actions/mainActions';

const initialState = {
    movies: [],
    loading: false,
    error: null,
    filters: {
        search: '',
        genre: '',
        year: '',
        sortBy: 'name',
        sortDirection: 'asc'
    }
};

const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearMovieError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch All Movies
        builder.addCase(fetchAllMovies.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAllMovies.fulfilled, (state, action) => {
            state.loading = false;
            state.movies = action.payload;
        });
        builder.addCase(fetchAllMovies.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Create Movie
        builder.addCase(createMovie.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createMovie.fulfilled, (state, action) => {
            state.loading = false;
            state.movies.push(action.payload);
        });
        builder.addCase(createMovie.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Edit Movie
        builder.addCase(editMovie.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(editMovie.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.movies.findIndex(movie => movie._id === action.payload._id);
            if (index !== -1) {
                state.movies[index] = action.payload;
            }
        });
        builder.addCase(editMovie.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Remove Movie
        builder.addCase(removeMovie.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(removeMovie.fulfilled, (state, action) => {
            state.loading = false;
            state.movies = state.movies.filter(movie => movie._id !== action.payload);
        });
        builder.addCase(removeMovie.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

// Selectors
export const selectAllMovies = state => state.movies.movies;
export const selectMovieById = (state, movieId) => 
    state.movies.movies.find(movie => movie._id === movieId);
export const selectMovieLoading = state => state.movies.loading;
export const selectMovieError = state => state.movies.error;
export const selectMovieFilters = state => state.movies.filters;

export const selectFilteredMovies = state => {
    const { movies } = state.movies;
    const { search, genre, year, sortBy, sortDirection } = state.movies.filters;

    let filtered = [...movies];

    // Apply filters
    if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(movie => 
            movie.name.toLowerCase().includes(searchLower)
        );
    }

    if (genre) {
        filtered = filtered.filter(movie => 
            movie.genres.includes(genre)
        );
    }

    if (year) {
        const yearNum = parseInt(year);
        filtered = filtered.filter(movie => {
            const movieYear = new Date(movie.premiered).getFullYear();
            return movieYear === yearNum;
        });
    }

    // Apply sorting
    filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'year':
                comparison = new Date(a.premiered) - new Date(b.premiered);
                break;
            case 'genre':
                comparison = (a.genres[0] || '').localeCompare(b.genres[0] || '');
                break;
            default:
                comparison = 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
};

export const { setFilters, clearFilters, clearMovieError } = movieSlice.actions;

export default movieSlice.reducer;