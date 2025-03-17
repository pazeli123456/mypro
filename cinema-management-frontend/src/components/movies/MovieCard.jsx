import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectPermissions } from '../../redux/reducers/authReducer';

const MovieCard = ({ movie, onDelete, showSubscriptions = true }) => {
    const permissions = useSelector(selectPermissions);
    
    // פונקציה שבודקת אם URL התמונה חוקי
    const getValidImageUrl = (imageUrl) => {
        if (!imageUrl || 
            typeof imageUrl !== 'string' || 
            imageUrl.includes('ERR_') || 
            imageUrl.includes('&/#x2F;')) {
            // החזר URL לתמונה ברירת מחדל אם התמונה לא חוקית
            return 'https://via.placeholder.com/300x450?text=No+Image';
        }
        return imageUrl;
    };

    // פרמט את התאריך לתצוגה נוחה
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="md:flex">
                <div className="md:w-1/3">
                    <img 
                        src={getValidImageUrl(movie.image)} 
                        alt={movie.name || 'Movie Poster'}
                        className="w-full h-auto max-h-80 object-cover"
                        onError={(e) => {
                            // אם יש שגיאה בטעינת התמונה, השתמש בתמונה ברירת מחדל
                            e.target.onerror = null; // מנע לופ אינסופי
                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                        }}
                    />
                </div>
                <div className="p-4 md:w-2/3">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold mb-2">{movie.name}</h2>
                        <div>
                            {movie.premiered && (
                                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                                    {formatDate(movie.premiered)}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        {movie.genres && movie.genres.map((genre, index) => (
                            <span 
                                key={index} 
                                className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-2"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                    
                    {showSubscriptions && movie.subscribers && movie.subscribers.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">צפו בסרט:</h3>
                            <ul className="list-disc list-inside">
                                {movie.subscribers.map((sub) => (
                                    <li key={sub.id} className="mb-1">
                                        <Link 
                                            to={`/members/${sub.id}`} 
                                            className="text-blue-600 hover:underline"
                                        >
                                            {sub.name}
                                        </Link>
                                        {sub.watchDate && ` - ${formatDate(sub.watchDate)}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="mt-6 flex">
                        {permissions.includes('Update Movies') && (
                            <Link 
                                to={`/movies/edit/${movie._id}`} 
                                className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                ערוך
                            </Link>
                        )}
                        
                        {permissions.includes('Delete Movies') && onDelete && typeof onDelete === 'function' && (
                            <button 
                                onClick={() => onDelete(movie._id)} 
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                מחק
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;