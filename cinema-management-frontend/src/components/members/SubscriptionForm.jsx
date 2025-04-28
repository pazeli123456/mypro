import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { fetchAllMovies } from '../../redux/slices/movieSlice';
import { createSubscription } from '../../redux/slices/subscriptionSlice';

const SubscriptionForm = ({ memberId, onComplete }) => {
  const dispatch = useDispatch();
  const { movies, isLoading: moviesLoading } = useSelector(state => state.movies);
  const { isLoading: subscriptionLoading, error } = useSelector(state => state.subscriptions);
  
  const [subscriptionData, setSubscriptionData] = useState({
    movieId: '',
    date: ''
  });
  
  const [validated, setValidated] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAllMovies());
  }, [dispatch]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionData(prev => ({
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
    
    const newSubscription = {
      memberId,
      movies: [{
        movieId: subscriptionData.movieId,
        date: subscriptionData.date
      }]
    };
    
    dispatch(createSubscription(newSubscription))
      .unwrap()
      .then(() => {
        if (onComplete) onComplete();
      })
      .catch((error) => {
        console.error('שגיאה ביצירת מנוי:', error);
      });
  };
  
  if (moviesLoading && movies.length === 0) {
    return (
      <div className="text-center p-3">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">טוען רשימת סרטים...</span>
      </div>
    );
  }
  
  if (movies.length === 0) {
    return (
      <Alert variant="info">
        אין סרטים זמינים להרשמה. נא להוסיף סרטים למערכת תחילה.
      </Alert>
    );
  }
  
  return (
    <div>
      <h6>הרשמה לסרט חדש</h6>
      
      {error && (
        <Alert variant="danger" className="mt-2 p-2">
          שגיאה: {error}
        </Alert>
      )}
      
      <Form noValidate validated={validated} onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3" controlId="movieSelect">
          <Form.Label>בחר סרט *</Form.Label>
          <Form.Select
            name="movieId"
            value={subscriptionData.movieId}
            onChange={handleChange}
            required
          >
            <option value="">בחר סרט...</option>
            {movies.map(movie => (
              <option key={movie._id} value={movie._id}>
                {movie.name} ({movie.premiered ? new Date(movie.premiered).getFullYear() : 'N/A'})
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            נא לבחור סרט
          </Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="subscriptionDate">
          <Form.Label>תאריך צפייה *</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={subscriptionData.date}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            נא להזין תאריך צפייה
          </Form.Control.Feedback>
        </Form.Group>
        
        <div className="d-flex justify-content-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={subscriptionLoading}
          >
            {subscriptionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                רושם...
              </>
            ) : (
              'הרשם לסרט'
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SubscriptionForm;