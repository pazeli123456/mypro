import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { createMember } from '../../redux/slices/memberSlice';

const AddMember = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.members);
  
  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    city: '',
    phoneNumber: ''
  });
  
  const [validated, setValidated] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({
      ...prev,
      [name]: value
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
    
    dispatch(createMember(memberData))
      .unwrap()
      .then(() => {
        navigate('/subscriptions');
      });
  };
  
  return (
    <Card className="shadow">
      <Card.Header as="h5" className="text-center bg-primary text-white">
        הוספת מנוי חדש
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            שגיאה בהוספת המנוי: {error}
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="memberName">
            <Form.Label>שם המנוי *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={memberData.name}
              onChange={handleChange}
              required
              placeholder="הזן שם מלא"
            />
            <Form.Control.Feedback type="invalid">
              שם המנוי הוא שדה חובה
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="memberEmail">
            <Form.Label>אימייל *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={memberData.email}
              onChange={handleChange}
              required
              placeholder="הזן כתובת אימייל"
            />
            <Form.Control.Feedback type="invalid">
              נא להזין כתובת אימייל תקינה
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="memberCity">
            <Form.Label>עיר *</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={memberData.city}
              onChange={handleChange}
              required
              placeholder="הזן שם עיר"
            />
            <Form.Control.Feedback type="invalid">
              עיר היא שדה חובה
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="memberPhoneNumber">
            <Form.Label>מספר טלפון</Form.Label>
            <Form.Control
              type="tel"
              name="phoneNumber"
              value={memberData.phoneNumber}
              onChange={handleChange}
              placeholder="הזן מספר טלפון (לא חובה)"
            />
          </Form.Group>
          
          <div className="d-flex justify-content-between">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/subscriptions')}
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
                'הוסף מנוי'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddMember; 