import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { logout } from '../../redux/slices/authSlice';
import AuthService from '../../api/authService';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // בדיקת הרשאות מנהל בצורה עמידה לשגיאות
  let isAdmin = false;
  try {
    if (isLoggedIn) {
      isAdmin = AuthService.isAdmin();
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
  
  // אפקט לבדיקת גלילה כדי להוסיף צל לנאבבר
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // סגירת התפריט בעת ניווט
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // בדיקה אם הקישור פעיל
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <BootstrapNavbar 
      bg="white" 
      variant="light" 
      expand="lg" 
      className={`fixed-top ${scrolled ? 'shadow-sm' : ''}`}
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="bi bi-film text-primary me-2 fs-4"></i>
          <span className="fw-bold">מערכת ניהול קולנוע</span>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          {isLoggedIn && (
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/main" 
                className={`mx-2 ${isActive('/main') ? 'active fw-bold' : ''}`}
              >
                <i className="bi bi-house-door me-1"></i> ראשי
              </Nav.Link>
              
              {user?.permissions?.includes('View Movies') && (
                <Nav.Link 
                  as={Link} 
                  to="/movies"
                  className={`mx-2 ${isActive('/movies') ? 'active fw-bold' : ''}`}
                >
                  <i className="bi bi-film me-1"></i> סרטים
                </Nav.Link>
              )}
              
              {user?.permissions?.includes('View Subscriptions') && (
                <Nav.Link 
                  as={Link} 
                  to="/subscriptions"
                  className={`mx-2 ${isActive('/subscriptions') ? 'active fw-bold' : ''}`}
                >
                  <i className="bi bi-people me-1"></i> מנויים
                </Nav.Link>
              )}
              
              {isAdmin && (
                <Nav.Link 
                  as={Link} 
                  to="/users"
                  className={`mx-2 ${isActive('/users') ? 'active fw-bold' : ''}`}
                >
                  <i className="bi bi-person-badge me-1"></i> ניהול משתמשים
                </Nav.Link>
              )}
            </Nav>
          )}
          
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" id="user-dropdown" className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-2"></i>
                  {user?.userName || 'משתמש'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item disabled className="text-muted">
                    מחובר כ: {user?.firstName} {user?.lastName}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    התנתק
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className={`mx-2 ${isActive('/login') ? 'active fw-bold' : ''}`}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> התחברות
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/create-account"
                  className={`mx-2 ${isActive('/create-account') ? 'active fw-bold' : ''}`}
                >
                  <i className="bi bi-person-plus me-1"></i> יצירת חשבון
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 