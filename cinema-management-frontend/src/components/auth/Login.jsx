import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../redux/slices/authSlice';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoggedIn, error, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // אם המשתמש כבר מחובר, הפנה לעמוד הראשי
    if (isLoggedIn) {
      navigate('/main');
    }
    
    // נקה שגיאות קודמות בטעינת הדף
    dispatch(clearError());
  }, [isLoggedIn, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    dispatch(login({ userName: username, password }));
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h2>התחברות למערכת</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
                  {error}
                </Alert>
              )}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" dir="rtl">
                  <Form.Label>שם משתמש</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="הכנס שם משתמש"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    שם משתמש הוא שדה חובה
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" dir="rtl">
                  <Form.Label>סיסמה</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="הכנס סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    סיסמה היא שדה חובה
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isLoading}
                    className="py-2"
                  >
                    {isLoading ? 'מתחבר...' : 'התחבר'}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-3">
                <span>משתמש חדש? </span>
                <Link to="/create-account">צור חשבון</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 