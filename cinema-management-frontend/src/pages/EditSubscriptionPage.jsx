// src/pages/EditSubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAllMovies, editSubscription } from '../redux/actions/mainActions';
import { 
    selectAllMovies, 
    selectMovieLoading 
} from '../redux/reducers/movieReducer';
import { subscriptionService } from '../services/apiService';
import {
    selectSubscriptionError,
    selectSubscriptionLoading
} from '../redux/reducers/subscriptionReducer';

const EditSubscriptionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const movies = useSelector(selectAllMovies);
    const moviesLoading = useSelector(selectMovieLoading);
    const subscriptionError = useSelector(selectSubscriptionError);
    const subscriptionLoading = useSelector(selectSubscriptionLoading);

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newMovie, setNewMovie] = useState({
        movieId: '',
        date: ''
    });

    useEffect(() => {
        if (!user?.permissions?.includes('Update Subscriptions')) {
            navigate('/subscriptions');
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                await dispatch(fetchAllMovies());
                const data = await subscriptionService.getById(id);
                if (!data) throw new Error('המנוי לא נמצא');
                setSubscription(data);
                setError('');
            } catch (err) {
                setError('שגיאה בטעינת פרטי המנוי');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, dispatch, navigate, user]);

    useEffect(() => {
        if (subscriptionError) {
            setError(subscriptionError);
        }
    }, [subscriptionError]);

    const handleAddMovie = () => {
        if (!newMovie.movieId || !newMovie.date) {
            setError('נא לבחור סרט ותאריך');
            return;
        }

        const movieExists = subscription.movies.some(
            movie => movie.movieId._id === newMovie.movieId
        );

        if (movieExists) {
            setError('סרט זה כבר קיים במנוי');
            return;
        }

        setSubscription(prev => ({
            ...prev,
            movies: [
                ...prev.movies,
                {
                    movieId: movies.find(m => m._id === newMovie.movieId),
                    date: newMovie.date
                }
            ]
        }));

        setNewMovie({ movieId: '', date: '' });
        setError('');
    };

    const handleRemoveMovie = (movieIndex) => {
        setSubscription(prev => ({
            ...prev,
            movies: prev.movies.filter((_, index) => index !== movieIndex)
        }));
    };

    const handleSave = async () => {
        if (subscription.movies.length === 0) {
            setError('חייב להיות לפחות סרט אחד במנוי');
            return;
        }

        try {
            setSaving(true);
            await dispatch(editSubscription({
                id,
                subscriptionData: {
                    movies: subscription.movies.map(movie => ({
                        movieId: movie.movieId._id,
                        date: movie.date
                    }))
                }
            })).unwrap();
            navigate('/subscriptions');
        } catch (err) {
            setError('שגיאה בשמירת המנוי');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading || moviesLoading || subscriptionLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="spinner mb-4"></div>
                    <p className="text-gray-600">טוען נתונים...</p>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-red-600">המנוי לא נמצא</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-8">
                    עריכת מנוי: {subscription.memberId?.name}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">סרטים במנוי</h2>
                    {subscription.movies.length === 0 ? (
                        <p className="text-gray-500">אין סרטים במנוי זה</p>
                    ) : (
                        <ul className="space-y-3">
                            {subscription.movies.map((movie, index) => (
                                <li 
                                    key={index} 
                                    className="flex justify-between items-center bg-gray-50 p-3 rounded"
                                >
                                    <div>
                                        <span className="font-medium">
                                            {movie.movieId.name}
                                        </span>
                                        <span className="text-gray-600 mr-4">
                                            {new Date(movie.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMovie(index)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        הסר
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="border-t pt-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">הוסף סרט חדש</h3>
                    <div className="flex gap-4 mb-4">
                        <select
                            value={newMovie.movieId}
                            onChange={(e) => setNewMovie(prev => ({ 
                                ...prev, 
                                movieId: e.target.value 
                            }))}
                            className="flex-1 p-2 border rounded"
                        >
                            <option value="">בחר סרט</option>
                            {movies
                                .filter(movie => !subscription.movies
                                    .some(m => m.movieId._id === movie._id))
                                .map(movie => (
                                    <option key={movie._id} value={movie._id}>
                                        {movie.name}
                                    </option>
                                ))
                            }
                        </select>
                        
                        <input
                            type="date"
                            value={newMovie.date}
                            onChange={(e) => setNewMovie(prev => ({ 
                                ...prev, 
                                date: e.target.value 
                            }))}
                            className="flex-1 p-2 border rounded"
                            max={new Date().toISOString().split('T')[0]}
                        />
                        
                        <button
                            onClick={handleAddMovie}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                            disabled={saving}
                        >
                            הוסף
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                    >
                        {saving ? 'שומר שינויים...' : 'שמור שינויים'}
                    </button>
                    
                    <button
                        onClick={() => navigate('/subscriptions')}
                        disabled={saving}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSubscriptionPage;