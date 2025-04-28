import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import { fetchMovieById, updateMovie } from '../../redux/slices/movieSlice';

const EditMovie = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentMovie, isLoading, error } = useSelector(state => state.movies);
  
  const [movieData, setMovieData] = useState({
    name: '',
    genres: '',
    image: '',
    premiered: ''
  });
  
  const [validated, setValidated] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  
  useEffect(() => {
    // טעינת נתוני הסרט בטעינת הדף
    dispatch(fetchMovieById(id))
      .unwrap()
      .catch(err => {
        setLoadingError('לא ניתן לטעון את נתוני הסרט. נא לנסות שוב מאוחר יותר.');
      });
  }, [dispatch, id]);
  
  useEffect(() => {
    // עדכון הטופס כאשר נתוני הסרט נטענים
    if (currentMovie) {
      setMovieData({
        name: currentMovie.name || '',
        genres: currentMovie.genres ? currentMovie.genres.join(', ') : '',
        image: currentMovie.image || '',
        premiered: currentMovie.premiered ? new Date(currentMovie.premiered).toISOString().split('T')[0] : ''
      });
    }
  }, [currentMovie]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovieData({ ...movieData, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // התאמת שדה הז'אנרים למערך
    const genresArray = movieData.genres.split(',').map(genre => genre.trim());
    
    dispatch(updateMovie({
      id,
      movieData: {
        ...movieData,
        genres: genresArray
      }
    }))
    .unwrap()
    .then(() => {
      navigate('/movies');
    })
    .catch(() => {
      // שגיאה תטופל על ידי ה-slice
    });
  };

  if (loadingError) {
    return (
      <Alert variant="danger">
        {loadingError}
      </Alert>
    );
  }

  if (isLoading && !currentMovie) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">טוען נתוני סרט...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <h2 className="text-center mb-4">עריכת סרט</h2>
        
        {error && (
          <Alert variant="danger">
            שגיאה: {error}
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="movieName">
                <Form.Label>שם הסרט</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={movieData.name}
                  onChange={handleChange}
                  placeholder="הכנס שם סרט"
                />
                <Form.Control.Feedback type="invalid">
                  שם הסרט הוא שדה חובה
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="movieGenres">
                <Form.Label>ז'אנרים (מופרדים בפסיקים)</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="genres"
                  value={movieData.genres}
                  onChange={handleChange}
                  placeholder="דרמה, קומדיה, פעולה"
                />
                <Form.Control.Feedback type="invalid">
                  יש להזין לפחות ז'אנר אחד
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="movieImage">
                <Form.Label>קישור לתמונה</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="image"
                  value={movieData.image}
                  onChange={handleChange}
                  placeholder="הכנס קישור לתמונת הסרט"
                />
                <Form.Control.Feedback type="invalid">
                  קישור לתמונה הוא שדה חובה
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="moviePremiered">
                <Form.Label>תאריך בכורה</Form.Label>
                <Form.Control
                  required
                  type="date"
                  name="premiered"
                  value={movieData.premiered}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  תאריך בכורה הוא שדה חובה
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between mt-4">
            <Button 
              variant="primary" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'שומר...' : 'עדכן סרט'}
            </Button>
            
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/movies')}
            >
              ביטול
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EditMovie; 