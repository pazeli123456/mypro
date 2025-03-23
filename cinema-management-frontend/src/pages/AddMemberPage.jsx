import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { memberService } from '../services/apiService';
import { selectPermissions } from '../redux/reducers/authReducer';

const AddMemberPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const permissions = useSelector(selectPermissions);

    useEffect(() => {
        if (!permissions.includes('Create Members')) {
            navigate('/members');
            return;
        }
    }, [permissions, navigate]);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!name || !email || !city) {
                setError('כל השדות הם חובה');
                setLoading(false);
                return;
            }

            await memberService.create({ name, email, city });
            setSuccess('החבר נוסף בהצלחה!');
            setTimeout(() => navigate('/members'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'שגיאה בהוספת החבר');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-8">הוספת חבר חדש</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        {success}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            שם
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="הכנס שם"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            אימייל
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="הכנס אימייל"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            עיר
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="הכנס עיר"
                            required
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                    >
                        {loading ? 'שומר...' : 'שמור'}
                    </button>
                    
                    <button
                        onClick={() => navigate('/members')}
                        disabled={loading}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMemberPage;
