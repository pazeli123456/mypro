import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Button } from 'react-bootstrap';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import AllUsers from './AllUsers';
import AddUser from './AddUser';
import EditUser from './EditUser';

const UsersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    // הגדרת הטאב הפעיל בהתאם לנתיב
    if (location.pathname.includes('/users/add')) {
      setActiveTab('add');
    } else if (location.pathname.includes('/users/edit')) {
      setActiveTab('all'); // עריכה מופיעה בטאב של כל המשתמשים
    } else {
      setActiveTab('all');
    }
  }, [location.pathname]);
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    if (key === 'all') {
      navigate('/users');
    } else if (key === 'add') {
      navigate('/users/add');
    }
  };
  
  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">ניהול משתמשים</h2>
          <p className="text-muted">
            צפייה, הוספה ועריכה של משתמשי המערכת וניהול הרשאותיהם
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-4"
          >
            <Tab eventKey="all" title="כל המשתמשים">
              {/* תוכן הטאב יוצג על-ידי Routes */}
            </Tab>
            
            <Tab eventKey="add" title="הוסף משתמש חדש">
              {/* תוכן הטאב יוצג על-ידי Routes */}
            </Tab>
          </Tabs>
          
          <Routes>
            <Route path="/" element={<AllUsers />} />
            <Route path="/add" element={<AddUser />} />
            <Route path="/edit/:id" element={<EditUser />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default UsersPage; 