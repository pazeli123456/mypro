// src/pages/SubscriptionsPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllSubscriptions } from '../redux/actions/mainActions';
import { selectAllSubscriptions } from '../redux/reducers/subscriptionReducer';
import { deleteSubscription } from '../services/apiService';

const SubscriptionsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const subscriptions = useSelector(selectAllSubscriptions);
    const user = useSelector(state => state.user.user);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const permissions = user?.permissions || [];

    useEffect(() => {
        const loadSubscriptions = async () => {
            try {
                setLoading(true);
                await dispatch(fetchAllSubscriptions());
                setError('');
            } catch (err) {
                setError('שגיאה בטעינת המנויים');
                console.error('Failed to fetch subscriptions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSubscriptions();
    }, [dispatch]);

    const handleDeleteSubscription = async (subscriptionId) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק מנוי זה?')) {
            return;
        }

        try {
            await deleteSubscription(subscriptionId);
            await dispatch(fetchAllSubscriptions());
        } catch (err) {
            setError('שגיאה במחיקת המנוי');
            console.error('Failed to delete subscription:', err);
        }
    };

    const filteredSubscriptions = subscriptions.filter(subscription =>
        subscription.memberId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderSubscriptionCard = (subscription) => {
        return (
            <div key={subscription._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold">
                            {subscription.memberId?.name || 'חבר לא ידוע'}
                        </h3>
                        <p className="text-gray-600">
                            {subscription.memberId?.email || 'אימייל לא זמין'}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {permissions.includes('Update Subscriptions') && (
                            <button
                                onClick={() => navigate(`/subscriptions/edit/${subscription._id}`)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                            >
                                ערוך
                            </button>
                        )}
                        
                        {permissions.includes('Delete Subscriptions') && (
                            <button
                                onClick={() => handleDeleteSubscription(subscription._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            >
                                מחק
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <h4 className="font-semibold mb-2">סרטים שנצפו:</h4>
                    {subscription.movies && subscription.movies.length > 0 ? (
                        <ul className="space-y-2">
                            {subscription.movies.map((movie, index) => (
                                <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span>{movie.movieId?.name || 'סרט לא ידוע'}</span>
                                    <span className="text-gray-600">
                                        {new Date(movie.date).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">לא נצפו סרטים עדיין</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">ניהול מנויים</h1>

                    {permissions.includes('Create Subscriptions') && (
                        <button
                            onClick={() => navigate('/subscriptions/add')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            הוסף מנוי חדש
                        </button>
                    )}
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם מנוי..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-96 p-2 border rounded shadow-sm"
                    />
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-600">טוען מנויים...</div>
                    </div>
                ) : filteredSubscriptions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-600">לא נמצאו מנויים</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSubscriptions.map(renderSubscriptionCard)}
                    </div>
                )}
            </div>

            <div className="fixed bottom-8 right-8">
                <button
                    onClick={() => navigate('/main')}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg"
                >
                    חזרה לדף הראשי
                </button>
            </div>
        </div>
    );
};

export default SubscriptionsPage;