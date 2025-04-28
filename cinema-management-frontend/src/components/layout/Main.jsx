import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import AuthService from '../../api/authService';

const Main = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = AuthService.isAdmin();
  
  const hasMoviesPermission = user?.permissions?.includes('View Movies');
  const hasSubscriptionsPermission = user?.permissions?.includes('View Subscriptions');

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">ברוך הבא למערכת ניהול קולנוע</h1>
          <p className="text-center text-muted">בחר את האפשרות הרצויה</p>
        </Col>
      </Row>
      
      <Row className="justify-content-center g-4">
        {hasMoviesPermission && (
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center mb-3">ניהול סרטים</Card.Title>
                <Card.Text>
                  צפייה, הוספה, עריכה ומחיקת סרטים במערכת. ניהול מידע אודות סרטים הזמינים למנויים.
                </Card.Text>
                <div className="mt-auto d-grid">
                  <Button 
                    as={Link} 
                    to="/movies" 
                    variant="primary"
                  >
                    צפה בסרטים
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {hasSubscriptionsPermission && (
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center mb-3">ניהול מנויים</Card.Title>
                <Card.Text>
                  צפייה, הוספה, עריכה ומחיקה של מנויים במערכת. ניהול המנויים והסרטים בהם צפו.
                </Card.Text>
                <div className="mt-auto d-grid">
                  <Button 
                    as={Link} 
                    to="/subscriptions" 
                    variant="primary"
                  >
                    צפה במנויים
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {isAdmin && (
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center mb-3">ניהול משתמשים</Card.Title>
                <Card.Text>
                  צפייה, הוספה, עריכה ומחיקה של משתמשי המערכת. ניהול הרשאות גישה למשתמשים השונים.
                </Card.Text>
                <div className="mt-auto d-grid">
                  <Button 
                    as={Link} 
                    to="/users" 
                    variant="primary"
                  >
                    צפה במשתמשים
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Main; 