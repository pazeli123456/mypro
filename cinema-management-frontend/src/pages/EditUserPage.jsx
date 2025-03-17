// src/pages/EditUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/apiService';

const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState({
        userName: '',
        firstName: '',
        lastName: '',
        email: '',
        sessionTimeOut: 60,
        permissions: []
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const userData = await userService.getById(id);
                // הגדר ערכי ברירת מחדל לשדות ריקים
                setUser({
                    userName: userData.userName || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    sessionTimeOut: userData.sessionTimeOut || 60,
                    permissions: userData.permissions || []
                });
            } catch (err) {
                console.error('Failed to fetch user:', err);
                setError('שגיאה בטעינת נתוני המשתמש');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (permission) => {
        setUser(prev => {
            const newPermissions = [...prev.permissions];
            if (newPermissions.includes(permission)) {
                return {
                    ...prev,
                    permissions: newPermissions.filter(p => p !== permission)
                };
            } else {
                return {
                    ...prev,
                    permissions: [...newPermissions, permission]
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // וודא שכל השדות מוגדרים לפני השליחה
            const updatedUser = {
                ...user,
                userName: user.userName || '', // וודא שהשדות לא undefined
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                sessionTimeOut: user.sessionTimeOut || 60
            };

            await userService.update(id, updatedUser);
            navigate('/users');
        } catch (err) {
            console.error('Failed to update user:', err);
            setError('שגיאה בעדכון המשתמש: ' + (err.message || 'פרטים חסרים או שגויים'));
        }
    };

    if (loading) {
        return <div className="text-center mt-8">טוען...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6">עריכת משתמש</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2">שם משתמש:</label>
                    <input
                        type="text"
                        name="userName"
                        value={user.userName || ''}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">שם פרטי:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={user.firstName || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">שם משפחה:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={user.lastName || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">אימייל:</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email || ''}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">זמן סשן (דקות):</label>
                    <input
                        type="number"
                        name="sessionTimeOut"
                        value={user.sessionTimeOut || 60}
                        onChange={handleChange}
                        min="1"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2">הרשאות:</label>
                    <div className="space-y-2">
                        {['View Movies', 'Create Movies', 'Update Movies', 'Delete Movies',
                          'View Subscriptions', 'Create Subscriptions', 'Update Subscriptions', 'Delete Subscriptions',
                          'View Members', 'Create Members', 'Update Members', 'Delete Members',
                          'Manage Users'].map(permission => (
                            <div key={permission} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={permission}
                                    checked={user.permissions?.includes(permission) || false}
                                    onChange={() => handlePermissionChange(permission)}
                                    className="mr-2"
                                />
                                <label htmlFor={permission}>{permission}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        עדכן
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        ביטול
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUserPage;