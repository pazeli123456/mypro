/**
 * @file MainPage.jsx
 * @description Component for the main dashboard page with navigation and user management
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, selectPermissions } from '../redux/reducers/authReducer';
import { selectAllMovies, selectMovieLoading } from '../redux/reducers/movieReducer';
import { initializeApp, clearAppData } from '../redux/actions/mainActions';
import { logout } from '../redux/actions/authActions';

const MainPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const permissions = useSelector(selectPermissions);
    const movies = useSelector(selectAllMovies);
    const loading = useSelector(selectMovieLoading);
    const [error, setError] = useState('');
    const [dataInitialized, setDataInitialized] = useState(false);

    useEffect(() => {
        // פונקציה לטעינת נתונים ראשונית
        const loadInitialData = async () => {
            try {
                // רק אם המשתמש מחובר, יש לו הרשאות, וטרם טענו נתונים
                if (user && permissions?.length > 0 && !dataInitialized) {
                    await dispatch(initializeApp()).unwrap();
                    setDataInitialized(true); // סמן שהנתונים כבר נטענו
                }
            } catch (err) {
                setError('שגיאה בטעינת נתונים');
                console.error('Failed to load data:', err);
            }
        };

        loadInitialData();
    }, [dispatch, user, permissions, dataInitialized]);

    const handleLogout = async () => {
        try {
            // נקה תחילה את נתוני האפליקציה
            await dispatch(clearAppData()).unwrap();
            // ואז התנתק
            await dispatch(logout()).unwrap();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            // אפילו אם יש שגיאה, עדיין ננקה את המידע המקומי ונעבור לדף ההתחברות
            navigate('/', { replace: true });
        }
    };
    // פונקציה לניווט לדף
    const navigateToPage = (path) => {
        navigate(path);
    };

    const menuItems = [
        {
            title: 'סרטים',
            items: [
                { label: 'צפה בסרטים', permission: 'View Movies', path: '/movies' },
                { label: 'הוסף סרט', permission: 'Create Movies', path: '/movies/add' }
            ]
        },
        {
            title: 'מנויים',
            items: [
                { label: 'צפה במנויים', permission: 'View Subscriptions', path: '/subscriptions' },
                { label: 'הוסף מנוי', permission: 'Create Subscriptions', path: '/subscriptions/add' }
            ]
        },
        {
            title: 'חברים',
            items: [
                { label: 'צפה בחברים', permission: 'View Members', path: '/members' },
                { label: 'הוסף חבר', permission: 'Create Members', path: '/members/add' }
            ]
        },
        {
            title: 'ניהול משתמשים',
            items: [
                { label: 'ניהול משתמשים', permission: 'Manage Users', path: '/users' }
            ],
            adminOnly: true
        }
    ];

    if (loading && !dataInitialized) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">טוען...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold">מערכת ניהול סרטים ומנויים</h1>
                        <div className="flex items-center">
                            <span className="ml-4">שלום, {user?.userName || 'משתמש'}</span>
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                התנתק
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                        <button
                            onClick={() => setError('')}
                            className="float-right font-bold"
                        >
                            &times;
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((section, index) => (
                        // בדוק אם צריך להציג את הסקציה (אם זו סקציה של אדמין, רק אם יש הרשאות מתאימות)
                        (!section.adminOnly || permissions?.includes('Manage Users')) && (
                            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                                    <div className="space-y-3">
                                        {section.items.map((item, itemIndex) => (
                                            // הצג רק פריטים שיש למשתמש הרשאה אליהם
                                            permissions?.includes(item.permission) && (
                                                <button
                                                    key={itemIndex}
                                                    onClick={() => navigate(item.path)}
                                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    {item.label}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </main>
        </div>
    );
};

export default MainPage;