import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner, Row, Col, FormCheck } from 'react-bootstrap';
import { fetchUserById, updateUser, fetchUserPermissions, updateUserPermissions } from '../../redux/slices/userSlice';

const EditUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { currentUser, currentUserPermissions, isLoading, error } = useSelector(state => state.users);
  
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [permissions, setPermissions] = useState([]);
  const [validated, setValidated] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  
  // רשימת כל ההרשאות האפשריות
  const availablePermissions = [
    // הרשאות סרטים
    { value: 'View Movies', label: 'צפייה בסרטים', category: 'movies' },
    { value: 'Create Movies', label: 'יצירת סרטים', category: 'movies' },
    { value: 'Edit Movies', label: 'עריכת סרטים', category: 'movies' },
    { value: 'Delete Movies', label: 'מחיקת סרטים', category: 'movies' },
    
    // הרשאות מנויים
    { value: 'View Subscriptions', label: 'צפייה במנויים', category: 'subscriptions' },
    { value: 'Create Subscriptions', label: 'יצירת מנויים', category: 'subscriptions' },
    { value: 'Edit Subscriptions', label: 'עריכת מנויים', category: 'subscriptions' },
    { value: 'Delete Subscriptions', label: 'מחיקת מנויים', category: 'subscriptions' },
    
    // הרשאות משתמשים
    { value: 'View Users', label: 'צפייה במשתמשים', category: 'users' },
    { value: 'Create Users', label: 'יצירת משתמשים', category: 'users' },
    { value: 'Edit Users', label: 'עריכת משתמשים', category: 'users' },
    { value: 'Delete Users', label: 'מחיקת משתמשים', category: 'users' }
  ];
  
  // מיון לפי קטגוריות
  const categories = {
    movies: { title: 'הרשאות סרטים', items: [] },
    subscriptions: { title: 'הרשאות מנויים', items: [] },
    users: { title: 'הרשאות משתמשים', items: [] }
  };
  
  availablePermissions.forEach(permission => {
    categories[permission.category].items.push(permission);
  });
  
  useEffect(() => {
    // טעינת נתוני המשתמש
    dispatch(fetchUserById(id))
      .unwrap()
      .catch(err => {
        setLoadingError('לא ניתן לטעון את נתוני המשתמש. נא לנסות שוב מאוחר יותר.');
      });
    
    // טעינת הרשאות המשתמש
    dispatch(fetchUserPermissions(id))
      .unwrap()
      .catch(err => {
        setLoadingError('לא ניתן לטעון את הרשאות המשתמש. נא לנסות שוב מאוחר יותר.');
      });
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentUser) {
      setUserData({
        username: currentUser.username || '',
        password: '', // Password field is empty by default
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (currentUserPermissions) {
      setPermissions(currentUserPermissions);
    }
  }, [currentUserPermissions]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePermissionChange = (permission) => {
    const updatedPermissions = [...permissions];
    
    if (updatedPermissions.includes(permission)) {
      // אם ההרשאה כבר קיימת, הסר אותה
      const index = updatedPermissions.indexOf(permission);
      updatedPermissions.splice(index, 1);
    } else {
      // אחרת, הוסף אותה
      updatedPermissions.push(permission);
    }
    
    setPermissions(updatedPermissions);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setValidated(true);
    
    // אם אין סיסמה, שלח נתונים ללא שדה הסיסמה
    const dataToSubmit = { ...userData };
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    
    // עדכון נתוני המשתמש
    dispatch(updateUser({ id, userData: dataToSubmit }))
      .unwrap()
      .then(() => {
        // עדכון הרשאות המשתמש
        return dispatch(updateUserPermissions({ id, permissions })).unwrap();
      })
      .then(() => {
        navigate('/users');
      })
      .catch(err => {
        // השגיאה תופיע ב-error state במידה ויש
      });
  };
  
  if (loadingError) {
    return (
      <Alert variant="danger">
        {loadingError}
      </Alert>
    );
  }
  
  if (isLoading && !currentUser) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">טוען נתוני משתמש...</p>
      </div>
    );
  }
  
  return (
    <Card className="shadow">
      <Card.Header as="h5" className="text-center bg-primary text-white">
        עריכת משתמש - {userData.firstName} {userData.lastName}
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            שגיאה בעדכון המשתמש: {error}
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="userFirstName">
                <Form.Label>שם פרטי *</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="הזן שם פרטי"
                />
                <Form.Control.Feedback type="invalid">
                  שם פרטי הוא שדה חובה
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="userLastName">
                <Form.Label>שם משפחה *</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="הזן שם משפחה"
                />
                <Form.Control.Feedback type="invalid">
                  שם משפחה הוא שדה חובה
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="userUsername">
                <Form.Label>שם משתמש *</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  required
                  placeholder="הזן שם משתמש"
                />
                <Form.Control.Feedback type="invalid">
                  שם משתמש הוא שדה חובה
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="userPassword">
                <Form.Label>סיסמה (השאר ריק לשמירת הסיסמה הקיימת)</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  placeholder="הזן סיסמה חדשה"
                  minLength={userData.password ? 6 : 0}
                />
                <Form.Control.Feedback type="invalid">
                  סיסמה חייבת להכיל לפחות 6 תווים
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>אימייל</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="הזן כתובת אימייל (לא חובה)"
            />
          </Form.Group>
          
          <hr className="my-4" />
          
          <h5 className="mb-3">הרשאות</h5>
          
          {Object.entries(categories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="mb-4">
              <h6>{category.title}</h6>
              
              <div className="d-flex flex-wrap gap-3 mt-2">
                {category.items.map(permission => (
                  <Form.Check
                    key={permission.value}
                    type="checkbox"
                    id={`permission-${permission.value}`}
                    label={permission.label}
                    checked={permissions.includes(permission.value)}
                    onChange={() => handlePermissionChange(permission.value)}
                    className="me-3"
                  />
                ))}
              </div>
            </div>
          ))}
          
          <div className="d-flex justify-content-between mt-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/users')}
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  מעדכן...
                </>
              ) : (
                'עדכן משתמש'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EditUser; 