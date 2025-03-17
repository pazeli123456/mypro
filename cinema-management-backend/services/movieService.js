const axios = require('axios');
const Movie = require('../models/Movie'); // מודל הסרטים

// שליפת סרטים מ-TVMaze API 
const fetchMoviesFromAPI = async () => {
    try {
        const response = await axios.get('https://api.tvmaze.com/shows');
        return response.data;
    } catch (err) {
        console.error('Error fetching movies from API:', err.message);
        throw new Error('Failed to fetch movies from API');
    }
};

// שמירת סרטים ב-DB
const saveMovies = async (movies) => {
    try {
        for (const movie of movies) {
            // בדוק אם הסרט כבר קיים ב-DB לפי שם
            const existingMovie = await Movie.findOne({ name: movie.name });
            if (!existingMovie) {
                const newMovie = new Movie({
                    name: movie.name,
                    genres: movie.genres,
                    image: movie.image?.medium || '', // בדיקה אם יש תמונה
                    premiered: movie.premiered,
                });
                await newMovie.save();
            }
        }
        console.log('Movies saved to DB successfully');
    } catch (err) {
        console.error('Error saving movies to DB:', err.message);
        throw new Error('Failed to save movies to DB');
    }
};

module.exports = { fetchMoviesFromAPI, saveMovies };
