import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../../redux/reducers/authReducer';

const SubscriptionCard = ({ subscription }) => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const permissions = user?.permissions || [];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold">{subscription.memberId?.name || 'חבר לא ידוע'}</h3>
                    <p className="text-gray-600">{subscription.movieId?.name || 'סרט לא ידוע'}</p>
                    <p className="text-gray-600">תאריך צפייה: {new Date(subscription.date).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                    {permissions.includes('Edit Subscriptions') && (
                        <button
                            onClick={() => navigate(`/subscriptions/edit/${subscription._id}`)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                            ערוך
                        </button>
                    )}
                    
                    {permissions.includes('Delete Subscriptions') && (
                        <button
                            onClick={() => navigate(`/subscriptions/delete/${subscription._id}`)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                            מחק
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <h4 className="font-semibold mb-2">פרטים נוספים:</h4>
                <div className="space-y-2">
                    <p><strong>חבר:</strong> {subscription.memberId?.email || 'לא זמין'}</p>
                    <p><strong>סרט:</strong> {subscription.movieId?.genres?.join(', ') || 'לא זמין'}</p>
                    <p><strong>תאריך:</strong> {new Date(subscription.date).toLocaleString()}</p>
                </div>
            </div>

            {permissions.includes('View Subscriptions') && (
                <div className="mt-6">
                    <button
                        onClick={() => navigate(`/subscriptions/${subscription._id}`)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        צפה בפרטים
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubscriptionCard; 