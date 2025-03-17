// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './redux/actions/authActions';
import { selectIsAuthenticated, selectPermissions } from './redux/reducers/authReducer';

// Components
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import MainPage from './pages/MainPage';
import MoviesPage from './pages/MoviesPage';
import EditMoviePage from './pages/EditMoviePage';
import AddMoviePage from './pages/AddMoviePage';
import AllSubscriptionsPage from './pages/AllSubscriptionsPage';
import AddSubscriptionPage from './pages/AddSubscriptionPage';
import EditSubscriptionPage from './pages/EditSubscriptionPage';
import ManageUsersPage from './pages/ManageUsersPage';
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';
import AddMemberPage from './pages/AddMemberPage';
import EditMemberPage from './pages/EditMemberPage';
import AllMovies from './pages/AllMovies';
import AllMembersPage from './pages/AllMembersPage';
import WatchedMoviesPage from './pages/WatchedMoviesPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const permissions = useSelector(selectPermissions);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (requiredPermissions.length > 0 && 
        !requiredPermissions.every(permission => permissions.includes(permission))) {
        return <Navigate to="/main" replace />;
    }

    return children;
};

const App = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        const initAuth = async () => {
            try {
                await dispatch(checkAuthStatus()).unwrap();
            } catch (err) {
                console.error('Auth check failed:', err);
                navigate('/');
            }
        };

        if (!isAuthenticated) {
            initAuth();
        }
    }, [dispatch, navigate, isAuthenticated]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/create-account" element={<CreateAccount />} />

                {/* Protected routes */}
                <Route
                    path="/main"
                    element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    }
                />

                {/* Movies routes */}
                <Route path="/movies">
                    <Route 
                        index 
                        element={
                            <ProtectedRoute requiredPermissions={['View Movies']}>
                                <MoviesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="add" 
                        element={
                            <ProtectedRoute requiredPermissions={['Create Movies']}>
                                <AddMoviePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="edit/:id" 
                        element={
                            <ProtectedRoute requiredPermissions={['Update Movies']}>
                                <EditMoviePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="all" 
                        element={
                            <ProtectedRoute requiredPermissions={['View Movies']}>
                                <AllMovies />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Subscriptions routes */}
                <Route path="/subscriptions">
                    <Route 
                        index 
                        element={
                            <ProtectedRoute requiredPermissions={['View Subscriptions']}>
                                <AllSubscriptionsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="add" 
                        element={
                            <ProtectedRoute requiredPermissions={['Create Subscriptions']}>
                                <AddSubscriptionPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="edit/:id" 
                        element={
                            <ProtectedRoute requiredPermissions={['Update Subscriptions']}>
                                <EditSubscriptionPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Users Management routes */}
                <Route path="/users">
                    <Route 
                        index 
                        element={
                            <ProtectedRoute requiredPermissions={['Manage Users']}>
                                <ManageUsersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="add" 
                        element={
                            <ProtectedRoute requiredPermissions={['Manage Users']}>
                                <AddUserPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="edit/:id" 
                        element={
                            <ProtectedRoute requiredPermissions={['Manage Users']}>
                                <EditUserPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Members routes */}
                <Route path="/members">
                    <Route 
                        index 
                        element={
                            <ProtectedRoute requiredPermissions={['View Members']}>
                                <AllMembersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="add" 
                        element={
                            <ProtectedRoute requiredPermissions={['Create Members']}>
                                <AddMemberPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="edit/:id" 
                        element={
                            <ProtectedRoute requiredPermissions={['Update Members']}>
                                <EditMemberPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path=":id/watched" 
                        element={
                            <ProtectedRoute requiredPermissions={['View Members']}>
                                <WatchedMoviesPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

export default App;