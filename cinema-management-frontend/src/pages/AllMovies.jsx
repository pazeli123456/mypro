// src/pages/AllMovies.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllMovies, removeMovie } from '../redux/actions/mainActions';
import { selectAllMovies, selectMovieLoading } from '../redux/reducers/movieReducer';
import { selectPermissions } from '../redux/reducers/authReducer';
import MovieCard from '../components/movies/MovieCard';

const AllMovies = () => {
    const dispatch = useDispatch();
    const movies = useSelector(selectAllMovies);
    const loading = useSelector(selectMovieLoading);
    const permissions = useSelector(selectPermissions);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                if (!initialized) {
                    await dispatch(fetchAllMovies()).unwrap();
                    setInitialized(true);
                }
            } catch (err) {
                setError('שגיאה בטעינת הנתונים: ' + err.message);
                console.error('Failed to load movies:', err);
            }
        };

        loadMovies();
    }, [dispatch, initialized]);

    const handleDelete = async (movieId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק סרט זה?')) {
            try {
                await dispatch(removeMovie(movieId)).unwrap();
            } catch (err) {
                setError('שגיאה במחיקת הסרט: ' + err.message);
            }
        }
    };

    // פילטור לפי חיפוש
    const filteredMovies = searchTerm
        ? movies.filter(movie => 
            movie.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movie.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : movies;

    if (loading && !initialized) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2">טוען סרטים...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">ניהול סרטים</h1>
                {permissions.includes('Create Movies') && (
                    <Link 
                        to="/movies/add" 
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        הוסף סרט חדש
                    </Link>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button
                        onClick={() => setError('')}
                        className="float-right font-bold"
                    >
                        &times;
                    </button>
                </div>
            )}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="חפש סרט לפי שם או ז'אנר..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {filteredMovies.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">לא נמצאו סרטים</p>
                    {permissions.includes('Create Movies') && (
                        <Link 
                            to="/movies/add" 
                            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            הוסף סרט חדש
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredMovies.map(movie => (
                        <MovieCard 
                            key={movie._id} 
                            movie={movie} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllMovies;