// src/pages/ManageUsersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers } from '../redux/actions/mainActions';
import { userService } from '../services/apiService';
import { selectCurrentUser } from '../redux/reducers/authReducer';

const ManageUsersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'asc'
    });

    const hasManageUsersPermission = currentUser?.permissions?.includes('Manage Users');
    
    useEffect(() => {
        if (!hasManageUsersPermission) {
            navigate('/main');
            return;
        }
    }, [hasManageUsersPermission, navigate]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await userService.getAll();
            const filteredUsers = response.filter(u => u._id !== currentUser?._id)
                .map(user => ({
                    ...user,
                    name: user.name || 'N/A',
                    userName: user.userName || 'N/A',
                    createdDate: user.createdDate || new Date().toISOString()
                }));
            setUsers(filteredUsers);
        } catch (err) {
            setError('שגיאה בטעינת המשתמשים: ' + (err.message || 'אנא נסה שוב'));
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSort = useCallback((key) => {
        setSortConfig(prevSort => ({
            key,
            direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${userName}?`)) {
            return;
        }

        try {
            setError('');
            await userService.delete(userId);
            await loadUsers();
        } catch (err) {
            setError(`שגיאה במחיקת המשתמש: ${err.message || 'אנא נסה שוב'}`);
            console.error('Failed to delete user:', err);
        }
    };

    const getSortedAndFilteredUsers = useCallback(() => {
        return [...users]
            .filter(user => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    user.name?.toLowerCase().includes(searchLower) ||
                    user.userName?.toLowerCase().includes(searchLower)
                );
            })
            .sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
    }, [users, searchTerm, sortConfig]);

    const sortedAndFilteredUsers = getSortedAndFilteredUsers();

    const renderTableHeader = () => (
        <thead className="bg-gray-50">
            <tr>
                <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                >
                    שם {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('userName')}
                >
                    שם משתמש {sortConfig.key === 'userName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdDate')}
                >
                    תאריך יצירה {sortConfig.key === 'createdDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                </th>
            </tr>
        </thead>
    );

    const renderTableBody = () => (
        <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.createdDate).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/users/edit/${user._id}`)}
                                className="text-yellow-500 hover:text-yellow-600 transition-colors"
                            >
                                ערוך
                            </button>
                            <button
                                onClick={() => handleDeleteUser(user._id, user.userName)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                            >
                                מחק
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );

    if (!hasManageUsersPermission) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
                            <button
                                onClick={() => navigate('/users/add')}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                            >
                                משתמש חדש
                            </button>
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="חיפוש משתמשים..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-xl text-gray-600">טוען משתמשים...</div>
                            </div>
                        ) : sortedAndFilteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-xl text-gray-600">
                                    {searchTerm ? 'לא נמצאו משתמשים התואמים לחיפוש' : 'לא נמצאו משתמשים'}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    {renderTableHeader()}
                                    {renderTableBody()}
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-8 right-8">
                <button
                    onClick={() => navigate('/main')}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg transition-colors"
                >
                    חזרה לדף הראשי
                </button>
            </div>
        </div>
    );
};

export default ManageUsersPage;