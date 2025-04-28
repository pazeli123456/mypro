import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { fetchAllMovies, deleteMovie, searchMovies } from '../../redux/slices/movieSlice';
import { fetchMovieWatchers } from '../../redux/slices/subscriptionSlice';
import AuthService from '../../api/authService';

// פונקציית עזר לבדיקה וטיפול בURL של תמונות
const getValidImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/200x300?text=אין+תמונה';
  
  // בדיקה אם התמונה מתחילה ב-// או בקידומת לא תקינה
  if (imageUrl.startsWith('//') || imageUrl.includes('&/#x2F;')) {
    return 'https://placehold.co/200x300?text=תמונה+לא+תקינה';
  }
  
  // בדיקה אם הקישור מתחיל בhttp או https
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return `https://${imageUrl}`;
  }
  
  return imageUrl;
};

const AllMovies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [showWatchersFor, setShowWatchersFor] = useState(null);
  
  const dispatch = useDispatch();
  const { movies, isLoading, error } = useSelector((state) => state.movies);
  const { movieWatchers, isLoading: watchersLoading } = useSelector((state) => state.subscriptions);
  
  const canEditMovies = AuthService.hasPermission('Edit Movies');
  const canDeleteMovies = AuthService.hasPermission('Delete Movies');

  useEffect(() => {
    dispatch(fetchAllMovies());
  }, [dispatch]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchMovies(searchTerm));
    } else {
      dispatch(fetchAllMovies());
    }
  };

  const handleDeleteMovie = (id) => {
    dispatch(deleteMovie(id))
      .unwrap()
      .then(() => {
        setShowConfirmDelete(null);
      });
  };

  const toggleWatchersList = (movieId) => {
    if (showWatchersFor === movieId) {
      setShowWatchersFor(null);
    } else {
      setShowWatchersFor(movieId);
      dispatch(fetchMovieWatchers(movieId));
    }
  };

  if (isLoading && movies.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">טוען סרטים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        שגיאה בטעינת הסרטים: {error}
      </Alert>
    );
  }

  return (
    <div>
      <InputGroup className="mb-4">
        <Form.Control
          placeholder="חפש סרט לפי שם..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="primary" onClick={handleSearch}>
          חפש
        </Button>
        <Button 
          variant="outline-secondary" 
          onClick={() => {
            setSearchTerm('');
            dispatch(fetchAllMovies());
          }}
        >
          אפס
        </Button>
      </InputGroup>

      {movies.length === 0 ? (
        <Alert variant="info">
          לא נמצאו סרטים. נסה לשנות את החיפוש או להוסיף סרטים חדשים.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {movies.map(movie => (
            <Col key={movie._id}>
              <Card className="h-100">
                {movie.image && (
                  <Card.Img 
                    variant="top" 
                    src={getValidImageUrl(movie.image)} 
                    alt={movie.name}
                    className="movie-image" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://placehold.co/200x300?text=תמונה+שגויה';
                    }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{movie.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {new Date(movie.premiered).getFullYear()}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>ז'אנרים: </strong>
                    {movie.genres.join(', ')}
                  </Card.Text>
                  
                  <div className="mt-3">
                    <strong>נצפה על ידי:</strong>
                    <div className="mt-2">
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => toggleWatchersList(movie._id)}
                      >
                        {showWatchersFor === movie._id ? 'הסתר רשימה' : 'הצג צופים'}
                      </Button>
                      
                      {showWatchersFor === movie._id && (
                        <div className="mt-2">
                          {watchersLoading ? (
                            <div className="text-center p-2">
                              <Spinner animation="border" size="sm" /> טוען...
                            </div>
                          ) : movieWatchers.length > 0 ? (
                            <ul className="list-unstyled small">
                              {movieWatchers.map(watcher => (
                                <li key={watcher._id} className="p-1 border-bottom">
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <strong>{watcher.name}</strong>
                                      <div className="text-muted small">
                                        תאריך צפייה: {new Date(watcher.date).toLocaleDateString('he-IL')}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Alert variant="light" className="p-2 text-center small">
                              אין צופים רשומים לסרט זה
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
                
                <Card.Footer className="bg-white border-0">
                  <div className="d-flex justify-content-between">
                    {canEditMovies && (
                      <Button 
                        as={Link} 
                        to={`/movies/edit/${movie._id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        עריכה
                      </Button>
                    )}
                    
                    {canDeleteMovies && (
                      <>
                        {showConfirmDelete === movie._id ? (
                          <div className="d-flex">
                            <Button 
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteMovie(movie._id)}
                              className="me-2"
                            >
                              מחק
                            </Button>
                            <Button 
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowConfirmDelete(null)}
                            >
                              ביטול
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setShowConfirmDelete(movie._id)}
                          >
                            מחיקה
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
      )}
    </div>
  );
};

export default AllMovies; 