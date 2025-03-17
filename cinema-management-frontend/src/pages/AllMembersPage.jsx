// src/pages/AllMembersPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllMembers, removeMember } from '../redux/actions/mainActions';
import { selectAllMembers, selectMemberLoading } from '../redux/reducers/memberReducer';
import { selectPermissions } from '../redux/reducers/authReducer';
import MemberCard from '../components/members/MemberCard';

const AllMembersPage = () => {
    const dispatch = useDispatch();
    const members = useSelector(selectAllMembers);
    const loading = useSelector(selectMemberLoading);
    const permissions = useSelector(selectPermissions);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                if (!initialized) {
                    await dispatch(fetchAllMembers()).unwrap();
                    setInitialized(true);
                }
            } catch (err) {
                setError('שגיאה בטעינת הנתונים: ' + err.message);
                console.error('Failed to load members:', err);
            }
        };

        loadMembers();
    }, [dispatch, initialized]);

    const handleDelete = async (memberId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק חבר זה?')) {
            try {
                await dispatch(removeMember(memberId)).unwrap();
            } catch (err) {
                setError('שגיאה במחיקת החבר: ' + err.message);
            }
        }
    };

    // פילטור לפי חיפוש
    const filteredMembers = searchTerm
        ? members.filter(member => 
            member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.city?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : members;

    if (loading && !initialized) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2">טוען חברים...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">ניהול חברים</h1>
                {permissions.includes('Create Members') && (
                    <Link 
                        to="/members/add" 
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        הוסף חבר חדש
                    </Link>
                )}
            </div>

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

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="חפש חבר לפי שם, אימייל או עיר..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">לא נמצאו חברים</p>
                    {permissions.includes('Create Members') && (
                        <Link 
                            to="/members/add" 
                            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            הוסף חבר חדש
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredMembers.map(member => (
                        <MemberCard 
                            key={member._id} 
                            member={member} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllMembersPage;