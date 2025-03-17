import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { movieService } from '../services/apiService';
import { editMovie } from '../redux/actions/mainActions';

const EditMoviePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);

    const [movie, setMovie] = useState({
        name: '',
        genres: [],
        image: '',
        premiered: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (!user?.permissions?.includes('Update Movies')) {
            navigate('/movies');
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        const loadMovie = async () => {
            try {
                setLoading(true);
                const data = await movieService.getMovieById(id);
                if (!data) throw new Error('הסרט לא נמצא');
                
                setMovie({
                    ...data,
                    genres: Array.isArray(data.genres) ? data.genres.join(', ') : data.genres,
                    premiered: data.premiered ? data.premiered.split('T')[0] : ''
                });
                setPreview(data.image);
                setError('');
            } catch (err) {
                setError('שגיאה בטעינת פרטי הסרט');
                console.error('Failed to fetch movie:', err);
            } finally {
                setLoading(false);
            }
        };

        loadMovie();
    }, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setMovie(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'image') {
            setPreview(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!movie.name || !movie.genres || !movie.image) {
            setError('אנא מלא את כל השדות הנדרשים');
            return;
        }

        try {
            setSaving(true);
            const updatedMovie = {
                ...movie,
                genres: movie.genres.split(',').map(g => g.trim()).filter(Boolean)
            };

            await dispatch(editMovie(id, updatedMovie));
            navigate('/movies');
        } catch (err) {
            setError(err.message || 'שגיאה בעדכון הסרט');
            console.error('Failed to update movie:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">טוען...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold mb-8 text-center">עריכת סרט</h1>

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
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                disabled={saving}
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
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                disabled={saving}
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
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                disabled={saving}
                            />
                        </div>

                        {preview && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    תצוגה מקדימה
                                </label>
                                <img
                                    src={preview}
                                    alt="תצוגה מקדימה"
                                    className="w-full max-h-48 object-cover rounded-md"
                                    onError={() => setPreview('/placeholder-movie.jpg')}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                תאריך יציאה
                            </label>
                            <input
                                type="date"
                                name="premiered"
                                value={movie.premiered}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                disabled={saving}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                            >
                                {saving ? 'שומר שינויים...' : 'שמור שינויים'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => navigate('/movies')}
                                disabled={saving}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                            >
                                ביטול
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditMoviePage;