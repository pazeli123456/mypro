const Movie = require('../models/Movie');

// פונקציה לשמירת סרטים
const saveMovies = async (movies) => {
    try {
        // שימוש ב-insertMany עם אפשרות של דילוג על כפילויות
        return await Movie.insertMany(movies, { 
            ordered: false,  // המשך גם אם יש כשל בהכנסת חלק מהרשומות
            rawResult: true  // החזר מידע נוסף על הפעולה
        });
    } catch (err) {
        console.error('Error saving movies to DB:', err.message);
        throw err;
    }
};

// פונקציה לשליפת כל הסרטים
const getAllMovies = async () => {
    try {
        return await Movie.find()
            .select('-__v')   // החרג את גרסת המסמך
            .sort({ premiered: -1 }); // מיון לפי תאריך בכורה מהחדש לישן
    } catch (err) {
        console.error('Error fetching movies from DB:', err.message);
        throw err;
    }
};

// שליפת סרט לפי ID
const getMovieById = async (movieId) => {
    try {
        const movie = await Movie.findById(movieId)
            .select('-__v');  // החרג את גרסת המסמך

        if (!movie) {
            throw new Error('Movie not found');
        }

        return movie;
    } catch (err) {
        console.error('Error fetching movie by ID:', err.message);
        throw err;
    }
};

// שליפת סרטים לפי ז'אנר
const getMoviesByGenre = async (genre) => {
    try {
        return await Movie.find({ 
            genres: { $regex: genre, $options: 'i' } 
        })
        .select('-__v')
        .sort({ premiered: -1 });
    } catch (err) {
        console.error('Error fetching movies by genre:', err.message);
        throw err;
    }
};

// עדכון סרט
const updateMovie = async (movieId, updateData) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            movieId, 
            updateData, 
            { 
                new: true,           // החזר את הרשומה המעודכנת
                runValidators: true   // הפעל בדיקות תיקוף
            }
        ).select('-__v');  // החרג את גרסת המסמך

        if (!updatedMovie) {
            throw new Error('Movie not found');
        }

        return updatedMovie;
    } catch (err) {
        console.error('Error updating movie:', err.message);
        throw err;
    }
};

// מחיקת סרט
const deleteMovie = async (movieId) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(movieId);

        if (!deletedMovie) {
            throw new Error('Movie not found');
        }

        return {
            message: 'Movie deleted successfully',
            deletedMovieId: movieId
        };
    } catch (err) {
        console.error('Error deleting movie:', err.message);
        throw err;
    }
};

module.exports = {
    saveMovies,
    getAllMovies,
    getMovieById,
    getMoviesByGenre,
    updateMovie,
    deleteMovie
};