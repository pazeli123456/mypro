import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../redux/reducers/authReducer';
import { memberService } from '../services/apiService';
import MemberCard from '../components/members/MemberCard';

const MembersPage = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const permissions = user?.permissions || [];
    
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const data = await memberService.getAllMembers();
                setMembers(data);
                setError('');
            } catch (err) {
                setError('שגיאה בטעינת רשימת החברים');
                console.error('Failed to fetch members:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">טוען...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">ניהול חברים</h1>

                    {permissions.includes('Create Members') && (
                        <button
                            onClick={() => navigate('/members/add')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            הוסף חבר חדש
                        </button>
                    )}
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם, אימייל או עיר..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-96 p-2 border rounded shadow-sm"
                    />
                </div>

                {filteredMembers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-600">
                            {searchTerm ? 'לא נמצאו חברים מתאימים לחיפוש' : 'אין חברים במערכת'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map(member => (
                            <MemberCard key={member._id} member={member} />
                        ))}
                    </div>
                )}

                <div className="fixed bottom-8 right-8">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg"
                    >
                        חזרה לדף הראשי
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MembersPage; 