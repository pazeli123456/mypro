// src/pages/AddUserPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userService } from '../services/apiService';
import { 
    validateUsername, 
    validateEmail, 
    validatePassword 
} from '../utils/validationUtils';

const AddUserPage = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    
    const [userData, setUserData] = useState({
        name: '',
        userName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const permissions = user?.permissions || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // אימות שם
        if (!userData.name) {
            newErrors.name = 'נדרש למלא שם';
        }

        // אימות שם משתמש
        if (!userData.userName) {
            newErrors.userName = 'נדרש למלא שם משתמש';
        } else if (!validateUsername(userData.userName)) {
            newErrors.userName = 'שם משתמש חייב להיות בין 3-20 תווים, רק אותיות, מספרים וקו תחתון';
        }

        // אימות אימייל
        if (!userData.email) {
            newErrors.email = 'נדרש למלא אימייל';
        } else if (!validateEmail(userData.email)) {
            newErrors.email = 'פורמט אימייל לא תקין';
        }

        // אימות סיסמה
        if (!userData.password) {
            newErrors.password = 'נדרש למלא סיסמה';
        } else if (!validatePassword(userData.password)) {
            newErrors.password = 'סיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד';
        }

        // אימות אימות סיסמה
        if (userData.password !== userData.confirmPassword) {
            newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const userPayload = {
                name: userData.name,
                userName: userData.userName,
                email: userData.email,
                password: userData.password
            };

            await userService.create(userPayload);
            
            alert('המשתמש נוצר בהצלחה!');
            navigate('/users');
        } catch (err) {
            alert(err.message || 'שגיאה ביצירת המשתמש');
            console.error('User creation failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-center mb-8">הוספת משתמש חדש</h1>

                <div className="space-y-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            שם
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.name && (
                            <span className="text-sm text-red-500 mt-1">{errors.name}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            שם משתמש
                        </label>
                        <input
                            type="text"
                            name="userName"
                            value={userData.userName}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.userName && (
                            <span className="text-sm text-red-500 mt-1">{errors.userName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            אימייל
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.email && (
                            <span className="text-sm text-red-500 mt-1">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            סיסמה
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.password && (
                            <span className="text-sm text-red-500 mt-1">{errors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            אימות סיסמה
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={userData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.confirmPassword && (
                            <span className="text-sm text-red-500 mt-1">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={handleSave}
                            disabled={loading || !permissions.includes('Manage Users')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                        >
                            {loading ? 'יוצר משתמש...' : 'צור משתמש'}
                        </button>
                        <button 
                            onClick={() => navigate('/users')}
                            disabled={loading}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded transition-colors duration-200 disabled:opacity-50"
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUserPage;