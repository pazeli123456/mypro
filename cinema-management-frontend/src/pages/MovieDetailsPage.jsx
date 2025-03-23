import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../redux/reducers/authReducer';
import { movieService } from '../services/apiService';

const MovieDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const permissions = user?.permissions || [];
    
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        if (!window.confirm('האם אתה בטוח שברצונך למחוק סרט זה?')) {
            return;
        }

        try {
            await movieService.deleteMovie(id);
            navigate('/movies');
        } catch (err) {
            setError('שגיאה במחיקת הסרט');
            console.error('Failed to delete movie:', err);
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/3">
                            <img
                                src={movie.image || 'https://via.placeholder.com/300x450?text=No+Image'}
                                alt={movie.name}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <div className="p-6 md:w-2/3">
                            <div className="flex justify-between items-start">
                                <h1 className="text-3xl font-bold text-gray-900">{movie.name}</h1>
                                <div className="flex gap-2">
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
                                            onClick={handleDelete}
 