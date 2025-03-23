// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from './redux/reducers/authReducer';
import { checkAuthStatus } from './redux/actions/authActions';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// דפים
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import AddMoviePage from './pages/AddMoviePage';
import EditMoviePage from './pages/EditMoviePage';
import DeleteMoviePage from './pages/DeleteMoviePage';
import MembersPage from './pages/MembersPage';
import EditMemberPage from './pages/EditMemberPage';
import AddMemberPage from './pages/AddMemberPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AddSubscriptionPage from './pages/AddSubscriptionPage';
import EditSubscriptionPage from './pages/EditSubscriptionPage';
import ManageUsersPage from './pages/ManageUsersPage';
import EditUserPage from './pages/EditUserPage';
import AddUserPage from './pages/AddUserPage';
import CreateAccount from './pages/CreateAccount';

const App = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await dispatch(checkAuthStatus()).unwrap();
                setLoading(false);
            } catch (err) {
                setError('שגיאה בטעינת האפליקציה');
                console.error('Failed to initialize app:', err);
                setLoading(false);
            }
        };

        initializeApp();
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">טוען...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <Routes>
                        {/* ניהול משתמשים */}
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute requiredPermissions={['Manage Users']}>
                                    <ManageUsersPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users/edit/:id"
                            element={
                                <ProtectedRoute requiredPermissions={['Manage Users']}>
                                    <EditUserPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users/add"
                            element={
                                <ProtectedRoute requiredPermissions={['Manage Users']}>
                                    <AddUserPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* נתיבים ציבוריים */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<CreateAccount />} />

                        {/* נתיבים מוגנים */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <MainPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* ניהול סרטים */}
                        <Route
                            path="/movies"
                            element={
                                <ProtectedRoute requiredPermissions={['View Movies']}>
                                    <MoviesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/movies/:id"
                            element={
                                <ProtectedRoute requiredPermissions={['View Movies']}>
                                    <MovieDetailsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/movies/add"
                            element={
                                <ProtectedRoute requiredPermissions={['Create Movies']}>
                                    <AddMoviePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/movies/edit/:id"
                            element={
                                <ProtectedRoute requiredPermissions={['Update Movies']}>
                                    <EditMoviePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/movies/delete/:id"
                            element={
                                <ProtectedRoute requiredPermissions={['Delete Movies']}>
                                    <DeleteMoviePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* ניהול חברים */}
                        <Route
                            path="/members"
                            element={
                                <ProtectedRoute requiredPermissions={['View Members']}>
                                    <MembersPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/members/add"
                            element={
                                <ProtectedRoute requiredPermissions={['Create Members']}>
                                    <AddMemberPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/members/edit/:id"
                            element={
                                <ProtectedRoute requiredPermissions={['Update Members']}>
                                    <EditMemberPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* ניהול מנויים */}
                        <Route
                            path="/subscriptions"
                            element={
                                <ProtectedRoute requiredPermissions={['View Subscriptions']}>
                                    <SubscriptionsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/subscriptions/add"
                            element={
                                <ProtectedRoute requiredPermissions={['Create Subscriptions']}>
                                    <AddSubscriptionPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/subscriptions/edit/:id"
                            element={
                                <ProtectedRoute requiredPermissions={['Edit Subscriptions']}>
                                    <EditSubscriptionPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* נתיב ברירת מחדל */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;