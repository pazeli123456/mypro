/**
 * @file MoviesPage.jsx
 * @description Component for displaying and managing movies
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllMovies } from '../redux/actions/mainActions';
import { 
    selectAllMovies, 
    selectMovieLoading, 
    selectMovieFilters, 
    setFilters 
} from '../redux/reducers/movieReducer';
import { movieService } from '../services/apiService';
import { selectPermissions } from '../redux/reducers/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const MoviesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Selectors
    const movies = useSelector(selectAllMovies);
    const loading = useSelector(selectMovieLoading);
    const filters = useSelector(selectMovieFilters);
    const permissions = useSelector(selectPermissions);
    
    // Local State
    const [error, setError] = useState('');

    // Initial Load
    useEffect(() => {
        const loadMovies = async () => {
            try {
                setError('');
                await dispatch(fetchAllMovies()).unwrap();
            } catch (err) {
                setError('טעינת הסרטים נכשלה');
                console.error('Failed to fetch movies:', err);
            }
        };

        loadMovies();
    }, [dispatch]);

    // Handlers
    const handleDeleteMovie = async (movieId) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק סרט זה?')) {
            return;
        }

        try {
            setError('');
            await movieService.delete(movieId);
            await dispatch(fetchAllMovies());
        } catch (err) {
            setError('מחיקת הסרט נכשלה');
            console.error('Failed to delete movie:', err);
        }
    };

    const handleFetchFromTVMaze = async () => {
        try {
            setError('');
            await movieService.fetchAndSaveMovies();
            await dispatch(fetchAllMovies());
        } catch (err) {
            setError('טעינת הסרטים מ-TVMaze נכשלה');
            console.error('Failed to fetch from TVMaze:', err);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFilters({ [name]: value }));
    };

    // Data Processing
    const filteredMovies = movies.filter(movie => {
        const nameMatch = movie.name.toLowerCase().includes((filters.search || '').toLowerCase());
        const genreMatch = !filters.genre || movie.genres.includes(filters.genre);
        return nameMatch && genreMatch;
    });

    const uniqueGenres = [...new Set(movies.flatMap(movie => movie.genres))].sort();

    // Loading State
    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-8 bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h1 className="text-3xl font-bold">ספריית סרטים</h1>
                        
                        <div className="flex flex-wrap gap-4">
                            <input
                                type="text"
                                name="search"
                                placeholder="חיפוש סרטים..."
                                value={filters.search || ''}
                                onChange={handleFilterChange}
                                className="p-2 border rounded"
                            />
                            
                            <select
                                name="genre"
                                value={filters.genre || ''}
                                onChange={handleFilterChange}
                                className="p-2 border rounded"
                            >
                                <option value="">כל הז'אנרים</option>
                                {uniqueGenres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            {permissions.includes('Create Movies') && (
                                <button
                                    onClick={() => navigate('/movies/add')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    הוסף סרט חדש
                                </button>
                            )}
                            
                            {permissions.includes('View Movies') && (
                                <button
                                    onClick={handleFetchFromTVMaze}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    טען מ-TVMaze
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                        <button
                            className="absolute top-0 right-0 p-3"
                            onClick={() => setError('')}
                        >
                            ×
                        </button>
                    </div>
                )}

                {filteredMovies.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-600">לא נמצאו סרטים</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMovies.map(movie => (
                            <div key={movie._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                {movie.image && (
                                    <img
                                        src={movie.image}
                                        alt={movie.name}
                                        className="w-full h-64 object-cover"
                                    />
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{movie.name}</h3>
                                    <p className="text-gray-600 mb-4">
                                        ז'אנרים: {movie.genres.join(', ')}
                                    </p>
                                    <p className="text-gray-600 mb-4">
                                        תאריך יציאה: {new Date(movie.premiered).toLocaleDateString()}
                                    </p>
                                    
                                    <div className="flex gap-4">
                                        {permissions.includes('Update Movies') && (
                                            <button
                                                onClick={() => navigate(`/movies/edit/${movie._id}`)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                                            >
                                                ערוך
                                            </button>
                                        )}
                                        
                                        {permissions.includes('Delete Movies') && (
                                            <button
                                                onClick={() => handleDeleteMovie(movie._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            >
                                                מחק
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-8 right-8">
                <button
                    onClick={() => navigate('/main')}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg"
                >
                    חזרה לדף הראשי
                </button>
            </div>
        </div>
    );
};

export default MoviesPage;