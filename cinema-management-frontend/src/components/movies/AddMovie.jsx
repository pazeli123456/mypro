import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { createMovie } from '../../redux/slices/movieSlice';

// פונקציית עזר לבדיקה ותיקון של URL תמונה
const normalizeImageUrl = (url) => {
  if (!url) return '';
  
  // הסרת תווים בעייתיים
  let cleanUrl = url.replace(/&\/#x2F;/g, '/');
  
  // בדיקת קישור חוקי - אם הקישור לא תקין, שימוש בתמונת ברירת מחדל
  try {
    new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
  } catch (e) {
    console.warn('קישור תמונה לא תקין:', url);
    return 'https://placehold.co/200x300?text=תמונה+לא+תקינה';
  }
  
  // הוספת פרוטוקול אם חסר
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }
  
  return cleanUrl;
};

const AddMovie = () => {
  const [movieData, setMovieData] = useState({
    name: '',
    genres: '',
    image: '',
    premiered: ''
  });
  const [validated, setValidated] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.movies);

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
    
    // נירמול כתובת התמונה
    const normalizedImageUrl = normalizeImageUrl(movieData.image);
    
    dispatch(createMovie({
      ...movieData,
      genres: genresArray,
      image: normalizedImageUrl
    }))
    .unwrap()
    .then(() => {
      navigate('/movies');
    })
    .catch(() => {
      // שגיאה תטופל על ידי ה-slice
    });
  };

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <h2 className="text-center mb-4">הוספת סרט חדש</h2>
        
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
              {isLoading ? 'שומר...' : 'שמור סרט'}
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

export default AddMovie; 