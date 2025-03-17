const axios = require('axios');

// פונקציה למשיכת סרטים מ-API חיצוני
const fetchMoviesFromAPI = async () => {
    const url = 'https://api.tvmaze.com/shows';
    
    try {
        const response = await axios.get(url);
        
        // עיצוב הנתונים לפורמט הנדרש
        return response.data.map(movie => ({
            name: movie.name,
            genres: movie.genres || [],
            image: movie.image ? movie.image.medium : '',
            premiered: movie.premiered ? new Date(movie.premiered) : null
        })).filter(movie => movie.name); // סינון סרטים ללא שם
    } catch (err) {
        console.error('Error fetching movies from API:', err.message);
        throw new Error('Failed to fetch movies from external API');
    }
};

module.exports = {
    fetchMoviesFromAPI,
};