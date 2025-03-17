const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    memberId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Member', 
        required: true 
    },
    movies: [
        {
            movieId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Movie', 
                required: true 
            },
            date: { 
                type: Date, 
                required: true,
                default: Date.now 
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // הגדרות נוספות
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// וירטואל להצגת מספר הסרטים
subscriptionSchema.virtual('movieCount').get(function() {
    return this.movies.length;
});

// מתודה לבדיקה האם חבר צפה בסרט מסוים
subscriptionSchema.methods.hasWatchedMovie = function(movieId) {
    return this.movies.some(movie => movie.movieId.toString() === movieId.toString());
};

module.exports = mongoose.model('Subscription', subscriptionSchema);