import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { useDispatch } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// Redux Store
import store from './redux/store'
import { initializeAuth } from './redux/slices/authSlice'

// Components - Layout
import Navbar from './components/layout/Navbar'
import Main from './components/layout/Main'

// Components - Auth
import Login from './components/auth/Login'
import CreateAccount from './components/auth/CreateAccount'

// Utils
import ProtectedRoute from './utils/ProtectedRoute'

// Lazy loading for future components
import React from 'react'
const MoviesPage = React.lazy(() => import('./components/movies/MoviesPage'))
const SubscriptionsPage = React.lazy(() => import('./components/members/SubscriptionsPage'))
const UsersPage = React.lazy(() => import('./components/users/UsersPage'))

// Loading fallback
const LoadingFallback = () => (
  <div className="text-center mt-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">טוען...</span>
    </div>
    <p className="mt-2">טוען...</p>
  </div>
)

// Wrapper component to handle redux actions
const AppContent = () => {
  const dispatch = useDispatch();

  // אתחול מצב האימות והגדרת כיוון הטקסט לעברית
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.setAttribute('dir', 'rtl');
    
    // אתחול מצב האימות מהזיכרון המקומי
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <div className="App">
      <Navbar />
      <main className="py-3">
        <Routes>
          {/* נתיבים ציבוריים */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />

          {/* נתיבים מוגנים - דורשים חיבור */}
          <Route element={<ProtectedRoute />}>
            <Route path="/main" element={<Main />} />
          </Route>

          {/* נתיבים שדורשים הרשאת סרטים */}
          <Route element={<ProtectedRoute requiredPermission="View Movies" />}>
            <Route path="/movies/*" element={
              <React.Suspense fallback={<LoadingFallback />}>
                <MoviesPage />
              </React.Suspense>
            } />
          </Route>

          {/* נתיבים שדורשים הרשאת מנויים */}
          <Route element={<ProtectedRoute requiredPermission="View Subscriptions" />}>
            <Route path="/subscriptions/*" element={
              <React.Suspense fallback={<LoadingFallback />}>
                <SubscriptionsPage />
              </React.Suspense>
            } />
          </Route>

          {/* נתיבים שדורשים הרשאת מנהל */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/users/*" element={
              <React.Suspense fallback={<LoadingFallback />}>
                <UsersPage />
              </React.Suspense>
            } />
          </Route>

          {/* הפניות ברירת מחדל */}
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="*" element={<Navigate to="/main" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
