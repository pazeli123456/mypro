import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner, Row, Col, FormCheck } from 'react-bootstrap';
import { createUser } from '../../redux/slices/userSlice';

const AddUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.users);
  
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    permissions: []
  });
  
  const [validated, setValidated] = useState(false);
  
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePermissionChange = (permission) => {
    const updatedPermissions = [...userData.permissions];
    
    if (updatedPermissions.includes(permission)) {
      // אם ההרשאה כבר קיימת, הסר אותה
      const index = updatedPermissions.indexOf(permission);
      updatedPermissions.splice(index, 1);
    } else {
      // אחרת, הוסף אותה
      updatedPermissions.push(permission);
    }
    
    setUserData(prev => ({
      ...prev,
      permissions: updatedPermissions
    }));
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
    
    dispatch(createUser(userData))
      .unwrap()
      .then(() => {
        navigate('/users');
      });
  };
  
  return (
    <Card className="shadow">
      <Card.Header as="h5" className="text-center bg-primary text-white">
        הוספת משתמש חדש
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            שגיאה בהוספת המשתמש: {error}
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
                <Form.Label>סיסמה *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  required
                  placeholder="הזן סיסמה"
                  minLength={6}
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
                    checked={userData.permissions.includes(permission.value)}
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
                  מוסיף...
                </>
              ) : (
                'הוסף משתמש'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddUser; 