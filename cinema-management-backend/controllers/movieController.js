const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { fetchMoviesFromAPI } = require('../services/movieService');
const { checkPermission } = require('../configs/authMiddleware');

// משיכת סרטים מ-API ושמירה ב-DB
router.post('/fetch-movies', checkPermission('Create Movies'), async (req, res) => {
    try {
        const moviesFromAPI = await fetchMoviesFromAPI();
        const formattedMovies = moviesFromAPI.map((movie) => ({
            name: movie.name,
            genres: movie.genres,
            image: movie.image ? movie.image.medium : '',
            premiered: movie.premiered,
        }));

        const bulkOps = formattedMovies.map(movie => ({
            updateOne: {
                filter: { name: movie.name },
                update: movie,
                upsert: true
            }
        }));

        await Movie.bulkWrite(bulkOps);
        
        res.status(201).json({ 
            message: 'Movies fetched and saved successfully', 
            count: formattedMovies.length 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// יצירת סרט חדש
router.post('/', checkPermission('Create Movies'), async (req, res) => {
    try {
        const { name, genres, image, premiered } = req.body;

        if (!name || !genres || !image || !premiered) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newMovie = new Movie({ name, genres, image, premiered });
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// שליפת כל הסרטים
router.get('/', checkPermission('View Movies'), async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// שליפת סרט לפי ID
router.get('/:id', checkPermission('View Movies'), async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// עדכון סרט
router.put('/:id', checkPermission('Edit Movies'), async (req, res) => {
    try {
        const { name, genres, image, premiered } = req.body;

        if (!name || !genres || !image || !premiered) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id, 
            { name, genres, image, premiered }, 
            { new: true, runValidators: true }
        );

        if (!updatedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json(updatedMovie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// מחיקת סרט
router.delete('/:id', checkPermission('Delete Movies'), async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.status(200).json({ message: `Movie with ID ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;