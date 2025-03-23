// src/components/members/MemberCard.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../../redux/reducers/authReducer';
import { subscriptionService } from '../../services/apiService';

const MemberCard = ({ member }) => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const permissions = user?.permissions || [];

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddMovie = async (movieId) => {
        if (!window.confirm('האם אתה בטוח שברצונך להוסיף סרט זה למנוי?')) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await subscriptionService.addMovieToMember(member._id, {
                movieId,
                date: new Date().toISOString()
            });

            setSuccess('הסרט נוסף בהצלחה למנוי');
        } catch (err) {
            setError('שגיאה בהוספת הסרט למנוי');
            console.error('Failed to add movie to member:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-gray-600">{member.email}</p>
                    <p className="text-gray-600">{member.city}</p>
                </div>

                <div className="flex gap-2">
                    {permissions.includes('Update Members') && (
                        <button
                            onClick={() => navigate(`/members/edit/${member._id}`)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                            ערוך
                        </button>
                    )}
                    
                    {permissions.includes('Delete Members') && (
                        <button
                            onClick={() => navigate(`/members/delete/${member._id}`)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                            מחק
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="mt-4">
                <h4 className="font-semibold mb-2">סרטים שנצפו:</h4>
                {member.subscriptions && member.subscriptions.length > 0 ? (
                    <ul className="space-y-2">
                        {member.subscriptions.map((subscription, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span>{subscription.movieId?.name || 'סרט לא ידוע'}</span>
                                <span className="text-gray-600">
                                    {formatDate(subscription.date)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">לא נצפו סרטים עדיין</p>
                )}
            </div>

            {permissions.includes('Edit Subscriptions') && (
                <div className="mt-6">
                    <button
                        onClick={() => navigate(`/subscriptions/edit/${member._id}`)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        ערוך מנויים
                    </button>
                </div>
            )}
        </div>
    );
};

export default MemberCard;