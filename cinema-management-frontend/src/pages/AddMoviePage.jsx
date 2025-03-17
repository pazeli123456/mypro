// src/pages/AddMoviePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createMovie } from '../redux/actions/mainActions';

const AddMoviePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.user);
    
    const [movie, setMovie] = useState({
        name: '',
        genres: '',
        image: '',
        premiered: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // בדיקת הרשאות
    if (!user?.permissions?.includes('Create Movies')) {
        return navigate('/movies');
    }

    const validateForm = () => {
        const errors = [];
        if (!movie.name) errors.push('שם הסרט הוא שדה חובה');
        if (!movie.genres) errors.push('יש להזין לפחות ז\'אנר אחד');
        if (!movie.image) errors.push('נדרשת תמונה לסרט');
        if (!movie.premiered) errors.push('תאריך יציאה הוא שדה חובה');
        
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMovie(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);
        try {
            const movieData = {
                ...movie,
                genres: movie.genres.split(',').map(genre => genre.trim())
            };
            
            await dispatch(createMovie(movieData));
            navigate('/movies');
        } catch (err) {
            setError(err.response?.data?.message || 'שגיאה בהוספת הסרט');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-8 text-center">הוספת סרט חדש</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            שם הסרט
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={movie.name}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ז'אנרים (מופרדים בפסיקים)
                        </label>
                        <input
                            type="text"
                            name="genres"
                            value={movie.genres}
                            onChange={handleChange}
                            placeholder="דרמה, קומדיה, אקשן"
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            כתובת תמונה
                        </label>
                        <input
                            type="url"
                            name="image"
                            value={movie.image}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            תאריך יציאה
                        </label>
                        <input
                            type="date"
                            name="premiered"
                            value={movie.premiered}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                        >
                            {loading ? 'מוסיף סרט...' : 'הוסף סרט'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/movies')}
                            disabled={loading}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                        >
                            ביטול
                        </button>
                    </div>
                </form>

                {movie.image && (
                    <div className="mt-8">
                        <p className="text-sm font-medium text-gray-700 mb-2">תצוגה מקדימה של התמונה:</p>
                        <img
                            src={movie.image}
                            alt="תצוגה מקדימה"
                            className="max-w-full h-64 object-cover rounded"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'placeholder-image.jpg';
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMoviePage;