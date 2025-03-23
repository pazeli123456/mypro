import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/actions/authActions';
import { selectCurrentUser } from '../redux/reducers/authReducer';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const permissions = user?.permissions || [];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const renderNavItem = (title, path, permission) => {
        if (!permissions.includes(permission)) {
            return null;
        }

        return (
            <button
                onClick={() => navigate(path)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
                {title}
            </button>
        );
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <button
                                onClick={() => navigate('/')}
                                className="text-xl font-bold text-gray-900"
                            >
                                מערכת ניהול קינמון
                            </button>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {renderNavItem('סרטים', '/movies', 'View Movies')}
                            {renderNavItem('חברים', '/members', 'View Members')}
                            {renderNavItem('מנויים', '/subscriptions', 'View Subscriptions')}
                            {renderNavItem('משתמשים', '/users', 'Manage Users')}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-700 mr-4">
                            {user?.username}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            התנתק
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 