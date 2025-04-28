import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createAccount, clearError } from '../../redux/slices/authSlice';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';

const CreateAccount = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
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

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות');
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    setValidated(true);
    
    if (form.checkValidity() === false || !validatePasswords()) {
      e.stopPropagation();
      return;
    }
    
    dispatch(createAccount({ userName: username, password, email }))
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch(() => {
        // שגיאה תטופל על ידי ה-slice
      });
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h2>יצירת חשבון</h2>
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

                <Form.Group className="mb-3" dir="rtl">
                  <Form.Label>אימייל</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="הכנס כתובת אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    יש להזין כתובת אימייל תקינה
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" dir="rtl">
                  <Form.Label>סיסמה</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="הכנס סיסמה (לפחות 6 תווים)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    isInvalid={!!passwordError && password.length < 6}
                  />
                  <Form.Control.Feedback type="invalid">
                    הסיסמה חייבת להכיל לפחות 6 תווים
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" dir="rtl">
                  <Form.Label>אימות סיסמה</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="הכנס סיסמה שוב"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    isInvalid={!!passwordError && password !== confirmPassword}
                  />
                  {passwordError && password !== confirmPassword && (
                    <Form.Control.Feedback type="invalid">
                      {passwordError}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isLoading}
                    className="py-2"
                  >
                    {isLoading ? 'יוצר חשבון...' : 'צור חשבון'}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-3">
                <span>כבר יש לך חשבון? </span>
                <Link to="/login">התחבר כאן</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateAccount; 