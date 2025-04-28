import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Alert, Spinner, Row, Col, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchAllUsers, deleteUser, fetchUserPermissions } from '../../redux/slices/userSlice';

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users, currentUserPermissions, isLoading, error } = useSelector(state => state.users);
  const { user: currentUser } = useSelector(state => state.auth);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(null);
  
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);
  
  const handleDeleteUser = (id) => {
    dispatch(deleteUser(id))
      .unwrap()
      .then(() => {
        setShowDeleteConfirm(null);
      });
  };
  
  const handleViewPermissions = (userId) => {
    if (!userId) {
      console.error('משתמש ללא מזהה תקין');
      return;
    }
    dispatch(fetchUserPermissions(userId))
      .unwrap()
      .then(() => {
        setShowPermissionsModal(userId);
      })
      .catch((error) => {
        console.error('שגיאה בטעינת הרשאות משתמש:', error);
      });
  };
  
  if (isLoading && users.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">טוען משתמשים...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        שגיאה בטעינת המשתמשים: {error}
      </Alert>
    );
  }
  
  if (users.length === 0) {
    return (
      <Alert variant="info">
        לא נמצאו משתמשים במערכת.
      </Alert>
    );
  }
  
  // המרת הרשאות למבנה מוכר יותר
  const formatPermissions = (permissions) => {
    if (!permissions || !Array.isArray(permissions)) return [];
    
    return permissions;
  };
  
  // מפה שמכילה תיאורים להרשאות
  const permissionDescriptions = {
    'View Movies': 'צפייה בסרטים',
    'Create Movies': 'יצירת סרטים',
    'Edit Movies': 'עריכת סרטים',
    'Delete Movies': 'מחיקת סרטים',
    'View Subscriptions': 'צפייה במנויים',
    'Create Subscriptions': 'יצירת מנויים',
    'Edit Subscriptions': 'עריכת מנויים',
    'Delete Subscriptions': 'מחיקת מנויים',
    'View Users': 'צפייה במשתמשים',
    'Create Users': 'יצירת משתמשים',
    'Edit Users': 'עריכת משתמשים',
    'Delete Users': 'מחיקת משתמשים'
  };
  
  return (
    <>
      <Row xs={1} md={2} lg={3} className="g-4">
        {users.map(user => (
          <Col key={user._id}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{user.firstName} {user.lastName}</h5>
                {user._id === currentUser?._id && (
                  <Badge bg="primary" pill>אתה</Badge>
                )}
              </Card.Header>
              <Card.Body>
                <Card.Text>
                  <strong>שם משתמש:</strong> {user.username}
                </Card.Text>
                {user.email && (
                  <Card.Text>
                    <strong>אימייל:</strong> {user.email}
                  </Card.Text>
                )}
                <Card.Text>
                  <strong>תאריך יצירה:</strong> {new Date(user.createdAt).toLocaleDateString('he-IL')}
                </Card.Text>
                
                <Button 
                  variant="link" 
                  className="p-0 mt-2"
                  onClick={() => handleViewPermissions(user._id)}
                >
                  צפייה בהרשאות
                </Button>
              </Card.Body>
              
              <Card.Footer className="bg-white border-0">
                <div className="d-flex justify-content-between">
                  {user._id !== currentUser?._id && (
                    <>
                      <Button 
                        as={Link} 
                        to={`/users/edit/${user._id}`}
                        variant="outline-primary" 
                        size="sm"
                      >
                        ערוך
                      </Button>
                      
                      {showDeleteConfirm === user._id ? (
                        <div className="d-flex">
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
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
                          onClick={() => setShowDeleteConfirm(user._id)}
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
      
      {/* מודל הצגת הרשאות */}
      <Modal 
        show={!!showPermissionsModal} 
        onHide={() => setShowPermissionsModal(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>הרשאות משתמש</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">טוען הרשאות...</span>
            </div>
          ) : (
            <>
              {currentUserPermissions?.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {formatPermissions(currentUserPermissions).map((permission) => (
                    <Badge 
                      key={`perm-${permission}`} 
                      bg="info" 
                      className="py-2 px-3"
                    >
                      {permissionDescriptions[permission] || permission}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted">למשתמש זה אין הרשאות</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPermissionsModal(null)}>
            סגור
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AllUsers; 