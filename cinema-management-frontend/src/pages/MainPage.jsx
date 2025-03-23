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
    const permissions = user?.permissions || [];
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
                { title: 'צפה בסרטים', path: '/movies', permission: 'View Movies' },
                { title: 'הוסף סרט', path: '/movies/add', permission: 'Create Movies' },
                { title: 'ערוך סרטים', path: '/movies', permission: 'Update Movies' },
                { title: 'מחק סרטים', path: '/movies', permission: 'Delete Movies' }
            ]
        },
        {
            title: 'חברים',
            items: [
                { title: 'צפה בחברים', path: '/members', permission: 'View Members' },
                { title: 'הוסף חבר', path: '/members/add', permission: 'Create Members' },
                { title: 'ערוך חברים', path: '/members', permission: 'Update Members' },
                { title: 'מחק חברים', path: '/members', permission: 'Delete Members' }
            ]
        },
        {
            title: 'מנויים',
            items: [
                { title: 'צפה במנויים', path: '/subscriptions', permission: 'View Subscriptions' },
                { title: 'הוסף מנוי', path: '/subscriptions/add', permission: 'Create Subscriptions' },
                { title: 'ערוך מנויים', path: '/subscriptions', permission: 'Edit Subscriptions' },
                { title: 'מחק מנויים', path: '/subscriptions', permission: 'Delete Subscriptions' }
            ]
        },
        {
            title: 'משתמשים',
            items: [
                { title: 'צפה במשתמשים', path: '/users', permission: 'Manage Users' },
                { title: 'הוסף משתמש', path: '/users/add', permission: 'Manage Users' },
                { title: 'ערוך משתמשים', path: '/users', permission: 'Manage Users' },
                { title: 'מחק משתמשים', path: '/users', permission: 'Manage Users' }
            ]
        }
    ];

    const renderMenuItem = (item) => {
        if (!permissions.includes(item.permission)) {
            return null;
        }

        return (
            <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className="w-full p-4 text-right bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
                {item.title}
            </button>
        );
    };

    const renderMenuSection = (section) => {
        const visibleItems = section.items.filter(item => permissions.includes(item.permission));
        if (visibleItems.length === 0) {
            return null;
        }

        return (
            <div key={section.title} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visibleItems.map(renderMenuItem)}
                </div>
            </div>
        );
    };

    if (loading && !dataInitialized) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">טוען...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                שלום, {user?.username}!
            </h1>
            <div className="space-y-8">
                {menuItems.map(renderMenuSection)}
            </div>
        </div>
    );
};

export default MainPage;