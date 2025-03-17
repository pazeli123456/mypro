// src/components/members/MemberCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectPermissions } from '../../redux/reducers/authReducer';
import { selectAllMovies } from '../../redux/reducers/movieReducer';
import { addMovieToMember } from '../../redux/actions/mainActions';

const MemberCard = ({ member, onDelete }) => {
    const dispatch = useDispatch();
    const permissions = useSelector(selectPermissions);
    const allMovies = useSelector(selectAllMovies);
    
    const [showAddMovie, setShowAddMovie] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState('');
    const [watchDate, setWatchDate] = useState(new Date().toISOString().substr(0, 10));
    const [error, setError] = useState('');

    // סנן סרטים שהחבר כבר צפה בהם
    const unwatchedMovies = allMovies.filter(movie => {
        return !member.movies || !member.movies.some(m => m.movieId === movie._id);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMovie) {
            setError('יש לבחור סרט');
            return;
        }

        try {
            await dispatch(addMovieToMember({
                memberId: member._id,
                movieData: {
                    movieId: selectedMovie,
                    date: watchDate
                }
            })).unwrap();
            setShowAddMovie(false);
            setSelectedMovie('');
            setError('');
        } catch (err) {
            setError('שגיאה בהוספת סרט: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 p-4">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
                <div className="flex">
                    {permissions.includes('Update Members') && (
                        <Link 
                            to={`/members/edit/${member._id}`} 
                            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            ערוך
                        </Link>
                    )}
                    
                    {permissions.includes('Delete Members') && (
                        <button 
                            onClick={() => onDelete(member._id)} 
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            מחק
                        </button>
                    )}
                </div>
            </div>
            
            <div className="mt-2">
                <p className="mb-1"><strong>אימייל:</strong> {member.email}</p>
                {member.city && <p className="mb-1"><strong>עיר:</strong> {member.city}</p>}
            </div>
            
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">סרטים שנצפו</h3>
                    {permissions.includes('Create Subscriptions') && (
                        <button 
                            onClick={() => setShowAddMovie(!showAddMovie)} 
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                            {showAddMovie ? 'ביטול' : 'הוסף סרט'}
                        </button>
                    )}
                </div>
                
                {showAddMovie && (
                    <div className="bg-gray-100 p-3 rounded mb-3">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label className="block mb-1">בחר סרט:</label>
                                <select 
                                    value={selectedMovie} 
                                    onChange={(e) => setSelectedMovie(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">-- בחר סרט --</option>
                                    {unwatchedMovies.map(movie => (
                                        <option key={movie._id} value={movie._id}>
                                            {movie.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="mb-2">
                                <label className="block mb-1">תאריך צפייה:</label>
                                <input 
                                    type="date" 
                                    value={watchDate} 
                                    onChange={(e) => setWatchDate(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                הוסף
                            </button>
                        </form>
                    </div>
                )}
                
                {!member.movies || member.movies.length === 0 ? (
                    <p className="text-gray-500">לא נצפו סרטים עדיין</p>
                ) : (
                    <ul className="list-disc list-inside">
                        {member.movies.map((movie) => (
                            <li key={movie.movieId} className="mb-1">
                                <Link 
                                    to={`/movies/${movie.movieId}`} 
                                    className="text-blue-600 hover:underline"
                                >
                                    {movie.name || 'סרט ללא שם'}
                                </Link>
                                {movie.date && ` - ${formatDate(movie.date)}`}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MemberCard;