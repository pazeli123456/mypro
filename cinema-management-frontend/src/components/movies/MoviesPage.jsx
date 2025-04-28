import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';

// Import sub-components
import AllMovies from './AllMovies';
import AddMovie from './AddMovie';
import EditMovie from './EditMovie';

const MoviesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  // Handler for changing tabs
  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(key === 'all' ? '/movies' : '/movies/add');
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">ניהול סרטים</h1>
          <p className="text-center text-muted">צפייה, הוספה, עריכה ומחיקה של סרטים במערכת</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-3"
            justify
          >
            <Tab eventKey="all" title="כל הסרטים">
              {activeTab === 'all' && (
                <p className="text-center">טוען את רשימת הסרטים...</p>
              )}
            </Tab>
            <Tab eventKey="add" title="הוסף סרט חדש">
              {activeTab === 'add' && (
                <p className="text-center">טופס הוספת סרט יוצג כאן...</p>
              )}
            </Tab>
          </Tabs>
        </Col>
      </Row>

      <Routes>
        <Route path="/" element={<AllMovies />} />
        <Route path="/add" element={<AddMovie />} />
        <Route path="/edit/:id" element={<EditMovie />} />
      </Routes>
    </Container>
  );
};

export default MoviesPage; 