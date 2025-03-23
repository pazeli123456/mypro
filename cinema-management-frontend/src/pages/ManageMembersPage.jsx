// src/pages/ManageMembersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    fetchAllMembers, 
    createMember, 
    removeMember 
} from '../redux/actions/mainActions';
import { Card, AlertDialog } from '@/components/ui/card';

const ManageMembersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ 
        city: '',
        membershipStatus: 'all' // 'all', 'active', 'expired'
    });
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const user = useSelector(state => state.user.currentUser);
    const permissions = user?.permissions || [];

    // בדיקת הרשאות
    useEffect(() => {
        if (!permissions.includes('Manage Members')) {
            navigate('/main');
            return;
        }
    }, [permissions, navigate]);

    // טעינת נתונים
    const loadMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await dispatch(fetchAllMembers()).unwrap();
            
            // עיבוד הנתונים והוספת שדות נדרשים
            const processedMembers = response.map(member => ({
                ...member,
                membershipStatus: calculateMembershipStatus(member),
                lastActivityDate: getLastActivityDate(member)
            }));
            
            setMembers(processedMembers);
        } catch (err) {
            setError('שגיאה בטעינת החברים: ' + (err.message || 'אנא נסה שוב'));
            console.error('Failed to fetch members:', err);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    // פונקציות עזר
    const calculateMembershipStatus = (member) => {
        if (!member.subscriptions?.length) return 'expired';
        const lastSubscription = member.subscriptions.reduce((latest, sub) => {
            return latest < new Date(sub.date) ? new Date(sub.date) : latest;
        }, new Date(0));
        return new Date(lastSubscription) > new Date() ? 'active' : 'expired';
    };

    const getLastActivityDate = (member) => {
        if (!member.subscriptions?.length) return null;
        return member.subscriptions.reduce((latest, sub) => {
            return latest < new Date(sub.date) ? new Date(sub.date) : latest;
        }, new Date(0));
    };

    // טיפול במחיקת חבר
    const handleDeleteMember = async () => {
        if (!selectedMember) return;

        try {
            setError('');
            await dispatch(removeMember(selectedMember._id)).unwrap();
            await loadMembers();
            setIsDeleteDialogOpen(false);
            setSelectedMember(null);
        } catch (err) {
            setError('שגיאה במחיקת החבר: ' + (err.message || 'אנא נסה שוב'));
        }
    };

    // פילטור וחיפוש
    const filteredMembers = members.filter(member => {
        const nameMatch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
        const cityMatch = !filters.city || member.city === filters.city;
        const statusMatch = filters.membershipStatus === 'all' || 
            member.membershipStatus === filters.membershipStatus;
        
        return nameMatch && cityMatch && statusMatch;
    });

    const uniqueCities = [...new Set(members.map(member => member.city))].filter(Boolean);

    // רינדור כרטיס חבר
    const renderMemberCard = (member) => (
        <Card key={member._id} className="bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-gray-600">{member.email}</p>
                    <p className="text-gray-500 mt-1">{member.city}</p>
                    
                    <div className={`mt-2 inline-block px-2 py-1 rounded-full text-sm ${
                        member.membershipStatus === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {member.membershipStatus === 'active' ? 'מנוי פעיל' : 'מנוי לא פעיל'}
                    </div>
                </div>

                <div className="flex gap-2">
                    {permissions.includes('Update Members') && (
                        <button
                            onClick={() => navigate(`/members/edit/${member._id}`)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors"
                        >
                            ערוך
                        </button>
                    )}
                    
                    {permissions.includes('Delete Members') && (
                        <button
                            onClick={() => {
                                setSelectedMember(member);
                                setIsDeleteDialogOpen(true);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                        >
                            מחק
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
                <button 
                    onClick={() => navigate(`/subscriptions/member/${member._id}`)}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                    צפה במנויים
                </button>
                
                {member.lastActivityDate && (
                    <span className="text-sm text-gray-500">
                        פעילות אחרונה: {new Date(member.lastActivityDate).toLocaleDateString('he-IL')}
                    </span>
                )}
            </div>
        </Card>
    );

    // רינדור ראשי
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">ניהול חברים</h1>

                    {permissions.includes('Create Members') && (
                        <button
                            onClick={() => navigate('/members/add')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                        >
                            הוסף חבר חדש
                        </button>
                    )}
                </div>

                {/* פילטרים וחיפוש */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="חיפוש לפי שם..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="md:w-48">
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">כל הערים</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:w-48">
                            <select
                                value={filters.membershipStatus}
                                onChange={(e) => setFilters(prev => ({ ...prev, membershipStatus: e.target.value }))}
                                className="w-full p-2 border rounded"
                            >
                                <option value="all">כל המנויים</option>
                                <option value="active">מנויים פעילים</option>
                                <option value="expired">מנויים לא פעילים</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* הודעות שגיאה */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* תצוגת חברים */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-600">טוען חברים...</div>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-600">
                            {searchTerm || filters.city || filters.membershipStatus !== 'all'
                                ? 'לא נמצאו חברים התואמים לחיפוש'
                                : 'לא נמצאו חברים'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map(renderMemberCard)}
                    </div>
                )}
            </div>

            {/* כפתור חזרה */}
            <div className="fixed bottom-8 right-8">
                <button
                    onClick={() => navigate('/main')}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg transition-colors"
                >
                    חזרה לדף הראשי
                </button>
            </div>

            {/* דיאלוג מחיקה */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <h2 className="text-lg font-bold mb-4">מחיקת חבר</h2>
                <p>האם אתה בטוח שברצונך למחוק את {selectedMember?.name}?</p>
                <p className="text-sm text-gray-500 mt-2">פעולה זו תמחק גם את כל המנויים המשויכים לחבר זה.</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={() => setIsDeleteDialogOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={handleDeleteMember}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        מחק
                    </button>
                </div>
            </AlertDialog>
        </div>
    );
};

export default ManageMembersPage;