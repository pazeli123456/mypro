import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../../redux/reducers/authReducer';

const UserCard = ({ user }) => {
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    const permissions = currentUser?.permissions || [];

    // רק מנהל יכול לראות ולערוך משתמשים אחרים
    if (!permissions.includes('Manage Users')) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold">{user.username}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-600">תפקיד: {user.role}</p>
                </div>

                <div className="flex gap-2">
                    {permissions.includes('Manage Users') && (
                        <button
                            onClick={() => navigate(`/users/edit/${user._id}`)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                            ערוך
                        </button>
                    )}
                    
                    {permissions.includes('Manage Users') && (
                        <button
                            onClick={() => navigate(`/users/delete/${user._id}`)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                            מחק
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <h4 className="font-semibold mb-2">הרשאות:</h4>
                <div className="flex flex-wrap gap-2">
                    {user.permissions.map((permission, index) => (
                        <span 
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                            {permission}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserCard; 