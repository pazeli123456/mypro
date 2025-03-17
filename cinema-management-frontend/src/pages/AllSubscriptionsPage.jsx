// src/pages/AllSubscriptionsPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectPermissions } from '../redux/reducers/authSlice';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { subscriptionService } from '../services/apiService';

const AllSubscriptionsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState([]);
    const permissions = useSelector(selectPermissions);

    useEffect(() => {
        const loadSubscriptions = async () => {
            try {
                setError('');
                setLoading(true);
                const result = await subscriptionService.getAll();
                setSubscriptions(result);
            } catch (err) {
                setError('טעינת המנויים נכשלה');
                console.error('Failed to load subscriptions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSubscriptions();
    }, []);

    if (!permissions?.includes('View Subscriptions')) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl text-red-600 mb-4">אין לך הרשאה לצפות בדף זה</h2>
                    <button
                        onClick={() => navigate('/main')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        חזרה לדף הראשי
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">מנויים</h1>
                            
                            {permissions?.includes('Create Subscriptions') && (
                                <button
                                    onClick={() => navigate('/subscriptions/add')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    הוסף מנוי חדש
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                {error}
                                <button
                                    className="absolute top-0 right-0 px-4 py-3"
                                    onClick={() => setError('')}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {subscriptions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">לא נמצאו מנויים</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {subscriptions.map(subscription => (
                                    <div 
                                        key={subscription._id}
                                        className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                                    >
                                        <h3 className="text-lg font-semibold mb-2">
                                            {subscription.memberName}
                                        </h3>
                                        <div className="text-sm text-gray-600 mb-4">
                                            <p>תאריך הצטרפות: {new Date(subscription.startDate).toLocaleDateString()}</p>
                                            <p>סטטוס: {subscription.status}</p>
                                        </div>
                                        
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => navigate(`/subscriptions/${subscription._id}`)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                                פרטים
                                            </button>
                                            
                                            {permissions?.includes('Edit Subscriptions') && (
                                                <button
                                                    onClick={() => navigate(`/subscriptions/edit/${subscription._id}`)}
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                                >
                                                    ערוך
                                                </button>
                                            )}
                                            
                                            {permissions?.includes('Delete Subscriptions') && (
                                                <button
                                                    onClick={() => handleDeleteSubscription(subscription._id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                >
                                                    מחק
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
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

export default AllSubscriptionsPage;