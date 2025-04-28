import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import AuthService from '../../api/authService';
import { fetchAllMovies } from '../../redux/slices/movieSlice';
import { fetchAllMembers } from '../../redux/slices/memberSlice';
import { fetchAllUsers } from '../../redux/slices/userSlice';

// אייקונים (דוגמה - נדרשת התקנה של ספריית אייקונים)
const MovieIcon = () => <i className="bi bi-film fs-1 text-primary"></i>;
const MemberIcon = () => <i className="bi bi-people fs-1 text-success"></i>;
const UserIcon = () => <i className="bi bi-person-badge fs-1 text-info"></i>;

const Main = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { movies = [] } = useSelector((state) => state.movies);
  const { members = [] } = useSelector((state) => state.members);
  const { users = [] } = useSelector((state) => state.users);
  
  const [loading, setLoading] = useState(true);
  
  const isAdmin = AuthService.isAdmin();
  const hasMoviesPermission = user?.permissions?.includes('View Movies');
  const hasSubscriptionsPermission = user?.permissions?.includes('View Subscriptions');

  // טעינת נתונים בסיסיים
  useEffect(() => {
    const loadData = async () => {
      const promises = [];
      
      if (hasMoviesPermission) {
        promises.push(dispatch(fetchAllMovies()));
      }
      
      if (hasSubscriptionsPermission) {
        promises.push(dispatch(fetchAllMembers()));
      }
      
      if (isAdmin) {
        promises.push(dispatch(fetchAllUsers()));
      }
      
      await Promise.all(promises);
      setLoading(false);
    };
    
    loadData();
  }, [dispatch, hasMoviesPermission, hasSubscriptionsPermission, isAdmin]);

  // רכיב חלונית עם סטטיסטיקה ואייקון
  const StatCard = ({ title, count, icon, color, linkTo, btnText, delay }) => (
    <div className={`dashboard-card fade-in`} style={{animationDelay: `${delay}ms`}}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className={`text-${color} dashboard-card-icon`}>
            {icon}
          </div>
          <div className="ms-3">
            <h6 className="mb-0">{title}</h6>
            <div className="dashboard-card-count">{count}</div>
          </div>
        </div>
        <p className="text-muted mb-4">לחץ כדי לצפות ברשימה המלאה ולערוך</p>
        <Button 
          as={Link} 
          to={linkTo}
          variant={color} 
          className="w-100"
        >
          {btnText}
        </Button>
      </div>
    </div>
  );

  // רכיב לכרטיסייה מפורטת
  const FeatureCard = ({ title, description, icon, linkTo, btnText, color, delay }) => (
    <Col lg={4} md={6} className="mb-4 fade-in" style={{animationDelay: `${delay}ms`}}>
      <Card className="h-100 dashboard-card">
        <Card.Body className="d-flex flex-column p-4">
          <div className={`text-${color} mb-3`}>
            {icon}
          </div>
          <Card.Title className="fs-4">{title}</Card.Title>
          <Card.Text className="text-muted mb-4">
            {description}
          </Card.Text>
          <div className="mt-auto d-grid">
            <Button 
              as={Link} 
              to={linkTo} 
              variant={color}
            >
              {btnText}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">טוען נתונים...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mb-3">ברוך הבא למערכת ניהול קולנוע</h1>
          <p className="text-center text-muted mb-5">נהל את הסרטים, המנויים והמשתמשים במערכת באופן קל ונוח</p>
        </Col>
      </Row>
      
      {/* קארדים של סטטיסטיקות */}
      <Row className="mb-5">
        {hasMoviesPermission && (
          <Col lg={4} md={6} className="mb-4">
            <StatCard 
              title="סרטים" 
              count={movies.length} 
              icon={<MovieIcon />} 
              color="primary" 
              linkTo="/movies"
              btnText="צפה בכל הסרטים"
              delay={100}
            />
          </Col>
        )}
        
        {hasSubscriptionsPermission && (
          <Col lg={4} md={6} className="mb-4">
            <StatCard 
              title="מנויים" 
              count={members.length} 
              icon={<MemberIcon />} 
              color="success"
              linkTo="/subscriptions"
              btnText="צפה בכל המנויים"
              delay={200}
            />
          </Col>
        )}
        
        {isAdmin && (
          <Col lg={4} md={6} className="mb-4">
            <StatCard 
              title="משתמשים" 
              count={users.length} 
              icon={<UserIcon />} 
              color="info"
              linkTo="/users"
              btnText="נהל משתמשים"
              delay={300}
            />
          </Col>
        )}
      </Row>
      
      <h2 className="text-center mb-4">שירותי המערכת</h2>
      
      {/* כרטיסיות לניהול */}
      <Row className="justify-content-center g-4">
        {hasMoviesPermission && (
          <FeatureCard 
            title="ניהול סרטים"
            description="צפייה, הוספה, עריכה ומחיקת סרטים במערכת. ניהול מידע אודות סרטים הזמינים למנויים."
            icon={<MovieIcon />}
            linkTo="/movies"
            btnText="צפה בסרטים"
            color="primary"
            delay={400}
          />
        )}
        
        {hasSubscriptionsPermission && (
          <FeatureCard 
            title="ניהול מנויים"
            description="צפייה, הוספה, עריכה ומחיקה של מנויים במערכת. ניהול המנויים והסרטים בהם צפו."
            icon={<MemberIcon />}
            linkTo="/subscriptions"
            btnText="צפה במנויים"
            color="success"
            delay={500}
          />
        )}
        
        {isAdmin && (
          <FeatureCard 
            title="ניהול משתמשים"
            description="צפייה, הוספה, עריכה ומחיקה של משתמשי המערכת. ניהול הרשאות גישה למשתמשים השונים."
            icon={<UserIcon />}
            linkTo="/users"
            btnText="צפה במשתמשים"
            color="info"
            delay={600}
          />
        )}
      </Row>
    </Container>
  );
};

export default Main; 