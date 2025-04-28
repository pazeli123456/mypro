import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Button } from 'react-bootstrap';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import AllMembers from './AllMembers';
import AddMember from './AddMember';
import EditMember from './EditMember';
import AuthService from '../../api/authService';

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  
  const canCreateSubscriptions = AuthService.hasPermission('Create Subscriptions');
  
  useEffect(() => {
    // הגדרת הטאב הפעיל בהתאם לנתיב
    if (location.pathname.includes('/subscriptions/add')) {
      setActiveTab('add');
    } else if (location.pathname.includes('/subscriptions/edit')) {
      setActiveTab('all'); // עריכה מופיעה בטאב של כל המנויים
    } else {
      setActiveTab('all');
    }
  }, [location.pathname]);
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    if (key === 'all') {
      navigate('/subscriptions');
    } else if (key === 'add') {
      navigate('/subscriptions/add');
    }
  };
  
  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">ניהול מנויים</h2>
          <p className="text-muted">
            צפייה, הוספה ועריכה של מנויי בית הקולנוע וניהול הסרטים שצפו בהם
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
            <Tab eventKey="all" title="כל המנויים">
              {/* תוכן הטאב יוצג על-ידי Routes */}
            </Tab>
            
            {canCreateSubscriptions && (
              <Tab eventKey="add" title="הוסף מנוי חדש">
                {/* תוכן הטאב יוצג על-ידי Routes */}
              </Tab>
            )}
          </Tabs>
          
          <Routes>
            <Route path="/" element={<AllMembers />} />
            <Route path="/add" element={<AddMember />} />
            <Route path="/edit/:id" element={<EditMember />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionsPage;