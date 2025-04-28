import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchAllMembers, deleteMember } from '../../redux/slices/memberSlice';
import { fetchMemberWatchedMovies } from '../../redux/slices/subscriptionSlice';
import AuthService from '../../api/authService';
import SubscriptionForm from './SubscriptionForm';

const AllMembers = () => {
  const dispatch = useDispatch();
  const { members, isLoading, error } = useSelector(state => state.members);
  const { memberWatchedMovies } = useSelector(state => state.subscriptions);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(null);
  
  const canEditMembers = AuthService.hasPermission('Edit Subscriptions');
  const canDeleteMembers = AuthService.hasPermission('Delete Subscriptions');

  useEffect(() => {
    dispatch(fetchAllMembers());
  }, [dispatch]);

  const handleDeleteMember = (id) => {
    dispatch(deleteMember(id))
      .unwrap()
      .then(() => {
        setShowDeleteConfirm(null);
      });
  };

  const toggleSubscriptionForm = (memberId) => {
    if (showSubscriptionForm === memberId) {
      setShowSubscriptionForm(null);
    } else {
      setShowSubscriptionForm(memberId);
      // טעינת הסרטים שהחבר צפה בהם
      dispatch(fetchMemberWatchedMovies(memberId));
    }
  };

  if (isLoading && members.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">טוען מנויים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        שגיאה בטעינת המנויים: {error}
      </Alert>
    );
  }

  if (members.length === 0) {
    return (
      <Alert variant="info">
        לא נמצאו מנויים במערכת.
      </Alert>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {members.map(member => (
        <Col key={member._id}>
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">{member.name}</h5>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <strong>אימייל:</strong> {member.email}
              </Card.Text>
              <Card.Text>
                <strong>עיר:</strong> {member.city}
              </Card.Text>
              {member.phoneNumber && (
                <Card.Text>
                  <strong>טלפון:</strong> {member.phoneNumber}
                </Card.Text>
              )}
              
              <div className="mt-4 border-top pt-3">
                <h6>סרטים שנצפו:</h6>
                
                {showSubscriptionForm === member._id ? (
                  memberWatchedMovies.length > 0 ? (
                    <ul className="list-unstyled">
                      {memberWatchedMovies.map(movie => (
                        <li key={movie._id} className="mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{movie.name}</strong>
                              <div className="text-muted small">
                                תאריך צפייה: {new Date(movie.date).toLocaleDateString('he-IL')}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Alert variant="light" className="p-2 text-center">
                      לא נמצאו סרטים שנצפו
                    </Alert>
                  )
                ) : (
                  <p className="text-muted">לחץ על "הרשם לסרט חדש" לצפייה ברשימת הסרטים שנצפו</p>
                )}
                
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => toggleSubscriptionForm(member._id)}
                >
                  {showSubscriptionForm === member._id ? 'סגור' : 'הרשם לסרט חדש'}
                </Button>
                
                {showSubscriptionForm === member._id && (
                  <div className="mt-3 border p-3 rounded">
                    <SubscriptionForm 
                      memberId={member._id} 
                      onComplete={() => setShowSubscriptionForm(null)} 
                    />
                  </div>
                )}
              </div>
            </Card.Body>
            
            <Card.Footer className="bg-white border-0">
              <div className="d-flex justify-content-between">
                {canEditMembers && (
                  <Button 
                    as={Link} 
                    to={`/subscriptions/edit/${member._id}`}
                    variant="outline-primary" 
                    size="sm"
                  >
                    ערוך
                  </Button>
                )}
                
                {canDeleteMembers && (
                  <>
                    {showDeleteConfirm === member._id ? (
                      <div className="d-flex">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteMember(member._id)}
                          className="ms-2"
                        >
                          אישור מחיקה
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          ביטול
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(member._id)}
                      >
                        מחק
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AllMembers; 