/**
 * @file Login.jsx
 * @description Component for user authentication and login functionality
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions';
import { selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../redux/reducers/authReducer';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        userName: '',
        password: ''
    });
    const [error, setError] = useState('');
    
    const loading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/main');
        }
        return () => setError('');
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // נקה שגיאות בעת הקלדה
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.userName || !formData.password) {
            setError('נא למלא את כל השדות');
            return;
        }

        try {
            const result = await dispatch(login(formData)).unwrap();
            if (result && result.token) {
                navigate('/main');
            }
        } catch (err) {
            setError(err.message || 'התחברות נכשלה');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        התחברות למערכת
                    </h2>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {(error || authError) && (
                        <div className="p-4 text-red-500 text-sm bg-red-50 rounded-md text-center">
                            {error || authError}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="userName" className="sr-only">שם משתמש</label>
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                required
                                value={formData.userName}
                                onChange={handleChange}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="שם משתמש"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">סיסמה</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="סיסמה"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'התחבר'
                            )}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <Link 
                            to="/create-account" 
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            משתמש חדש? צור חשבון
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;