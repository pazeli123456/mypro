import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../redux/reducers/authReducer';
import { movieService } from '../services/apiService';

const DeleteMoviePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const permissions = user?.permissions || [];
    
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                const data = await movieService.getMovieById(id);
                setMovie(data);
                setError('');
            } catch (err) {
                setError('שגיאה בטעינת פרטי הסרט');
                console.error('Failed to fetch movie details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק סרט זה? פעולה זו אינה הפיכה!')) {
            return;
        }

        try {
            setDeleting(true);
            await movieService.deleteMovie(id);
            navigate('/movies');
        } catch (err) {
            setError('שגיאה במחיקת הסרט');
            console.error('Failed to delete movie:', err);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">טוען...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">הסרט לא נמצא</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-red-600 mb-6">מחיקת סרט</h1>
                        
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">פרטי הסרט:</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <p><strong>שם:</strong> {movie.name}</p>
                                <p><strong>תאריך בכורה:</strong> {new Date(movie.premiered).toLocaleDateString()}</p>
                                <p><strong>ז'אנרים:</strong> {movie.genres?.join(', ')}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-red-600 font-semibold">
                                אזהרה: מחיקת סרט תמחק לצמיתות ולא ניתן לשחזר אותו!
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded disabled:opacity-50"
                            >
                                {deleting ? 'מוחק...' : 'מחק סרט'}
                            </button>
                            <button
                                onClick={() => navigate('/movies')}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteMoviePage; 