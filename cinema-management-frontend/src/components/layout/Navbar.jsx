import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { logout } from '../../redux/slices/authSlice';
import AuthService from '../../api/authService';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // בדיקת הרשאות מנהל בצורה עמידה לשגיאות
  let isAdmin = false;
  try {
    if (isLoggedIn) {
      isAdmin = AuthService.isAdmin();
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">מערכת ניהול קולנוע</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          
          {isLoggedIn && (
            <Nav className="me-auto" dir="rtl">
              <Nav.Link as={Link} to="/main">ראשי</Nav.Link>
              <Nav.Link as={Link} to="/movies">סרטים</Nav.Link>
              <Nav.Link as={Link} to="/subscriptions">מנויים</Nav.Link>
              {isAdmin && (
                <Nav.Link as={Link} to="/users">ניהול משתמשים</Nav.Link>
              )}
            </Nav>
          )}
          
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <>
                <span className="nav-text text-light my-auto me-3">
                  שלום, {user?.userName || 'משתמש'}
                </span>
                <Button 
                  variant="outline-light" 
                  onClick={handleLogout}
                >
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">התחברות</Nav.Link>
                <Nav.Link as={Link} to="/create-account">יצירת חשבון</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 