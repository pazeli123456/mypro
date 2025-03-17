// src/pages/WatchedMoviesPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { subscriptionService, memberService } from '../services/apiService';
import { fetchAllMovies } from '../redux/actions/mainActions';
import { Card, CardContent } from '@/components/ui/card';

const WatchedMoviesPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.user.currentUser);
    const allMovies = useSelector(state => state.movies.movies);
    
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [memberDetails, setMemberDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        genre: '',
        year: '',
        sortBy: 'date', // 'date', 'name', 'genre'
        sortDirection: 'desc'
    });

    // בדיקת הרשאות
    const hasViewPermission = currentUser?.permissions?.includes('View Subscriptions');
    const hasCreatePermission = currentUser?.permissions?.includes('Create Subscriptions');

    useEffect(() => {
        if (!hasViewPermission) {
            navigate('/main');
            return;
        }
    }, [hasViewPermission, navigate]);

    // טעינת נתונים
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            // טעינת סרטים אם צריך
            if (!allMovies?.length) {
                await dispatch(fetchAllMovies());
            }

            // טעינת נתוני המנוי
            const memberData = await memberService.getById(id);
            
            if (!memberData) {
                throw new Error('לא נמצאו נתונים עבור החבר');
            }

            setMemberDetails(memberData);
            
            // טעינת מנויים וסרטים שנצפו
            const subscriptions = await subscriptionService.getMemberSubscriptions(id);
            
            // עיבוד נתוני הצפייה
            const processedMovies = subscriptions.map(sub => ({
                ...sub.movie,
                watchDate: new Date(sub.date),
                yearReleased: sub.movie.premiered ? new Date(sub.movie.premiered).getFullYear() : null
            }));

            setWatchedMovies(processedMovies);
        } catch (err) {
            setError(err.message || 'שגיאה בטעינת הנתונים');
            console.error('Failed to load watched movies:', err);
        } finally {
            setLoading(false);
        }
    }, [id, dispatch, allMovies?.length]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // פילטור ומיון
    const uniqueGenres = useMemo(() => {
        const genres = new Set();
        watchedMovies.forEach(movie => {
            movie.genres?.forEach(genre => genres.add(genre));
        });
        return Array.from(genres).sort();
    }, [watchedMovies]);

    const uniqueYears = useMemo(() => {
        const years = new Set(watchedMovies.map(movie => movie.yearReleased).filter(Boolean));
        return Array.from(years).sort((a, b) => b - a);
    }, [watchedMovies]);

    const filteredAndSortedMovies = useMemo(() => {
        return [...watchedMovies]
            .filter(movie => {
                const searchMatch = !filters.search || 
                    movie.name.toLowerCase().includes(filters.search.toLowerCase());
                const genreMatch = !filters.genre || 
                    movie.genres?.includes(filters.genre);
                const yearMatch = !filters.year || 
                    movie.yearReleased === parseInt(filters.year);
                
                return searchMatch && genreMatch && yearMatch;
            })
            .sort((a, b) => {
                const direction = filters.sortDirection === 'asc' ? 1 : -1;
                
                switch (filters.sortBy) {
                    case 'name':
                        return direction * a.name.localeCompare(b.name);
                    case 'genre':
                        return direction * (a.genres?.[0] || '').localeCompare(b.genres?.[0] || '');
                    default: // date
                        return direction * (a.watchDate.getTime() - b.watchDate.getTime());
                }
            });
    }, [watchedMovies, filters]);

    // רינדור כרטיס סרט
    const renderMovieCard = (movie) => (
        <Card key={movie._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative pb-48">
                <img 
                    src={movie.image || '/api/placeholder/400/320'}
                    alt={movie.name}
                    className="absolute h-full w-full object-cover"
                />
            </div>
            <CardContent className="p-4">
                <h3 className="text-xl font-bold mb-2">{movie.name}</h3>
                <div className="text-sm text-gray-600 mb-2">
                    נצפה בתאריך: {movie.watchDate.toLocaleDateString('he-IL')}
                </div>
                {movie.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {movie.genres.map(genre => (
                            <span 
                                key={genre} 
                                className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                )}
                {movie.yearReleased && (
                    <div className="text-sm text-gray-500">
                        שנת יציאה: {movie.yearReleased}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (!hasViewPermission) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* כותרת ומידע על החבר */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold">סרטים שנצפו</h1>
                                {memberDetails && (
                                    <div className="mt-2">
                                        <p className="text-gray-600">חבר: {memberDetails.name}</p>
                                        <p className="text-gray-500 text-sm">
                                            אימייל: {memberDetails.email}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {hasCreatePermission && (
                                <button
                                    onClick={() => navigate(`/subscriptions/add?memberId=${id}`)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                                >
                                    הוסף צפייה חדשה
                                </button>
                            )}
                        </div>
                    </div>

                    {/* פילטרים */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="חיפוש סרטים..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="p-2 border rounded"
                            />
                            
                            <select
                                value={filters.genre}
                                onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                                className="p-2 border rounded"
                            >
                                <option value="">כל הז'אנרים</option>
                                {uniqueGenres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>

                            <select
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                className="p-2 border rounded"
                            >
                                <option value="">כל השנים</option>
                                {uniqueYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

                            <select
                                value={`${filters.sortBy}-${filters.sortDirection}`}
                                onChange={(e) => {
                                    const [sortBy, sortDirection] = e.target.value.split('-');
                                    setFilters(prev => ({ ...prev, sortBy, sortDirection }));
                                }}
                                className="p-2 border rounded"
                            >
                                <option value="date-desc">תאריך צפייה (חדש לישן)</option>
                                <option value="date-asc">תאריך צפייה (ישן לחדש)</option>
                                <option value="name-asc">שם (א-ת)</option>
                                <option value="name-desc">שם (ת-א)</option>
                                <option value="genre-asc">ז'אנר (א-ת)</option>
                                <option value="genre-desc">ז'אנר (ת-א)</option>
                            </select>
                        </div>
                    </div>

                    {/* תוכן עיקרי */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-xl text-gray-600">טוען נתונים...</div>
                            </div>
                        ) : filteredAndSortedMovies.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-xl text-gray-600">
                                    {filters.search || filters.genre || filters.year
                                        ? 'לא נמצאו סרטים התואמים לחיפוש'
                                        : 'לא נמצאו סרטים שנצפו'}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedMovies.map(renderMovieCard)}
                            </div>
                        )}
                    </div>
                </div>

                {/* כפתורי ניווט */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={() => navigate('/subscriptions')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        חזרה למנויים
                    </button>
                    <button
                        onClick={() => navigate('/main')}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded transition-colors"
                    >
                        חזרה לדף הראשי
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WatchedMoviesPage;