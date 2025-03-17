const axios = require('axios');
const Subscription = require('../models/Subscription');
const Member = require('../models/Member');
const Movie = require('../models/Movie');

// פונקציה למשיכת מנויים מ-API חיצוני (אם נדרש)
const fetchSubscriptionsFromAPI = async () => {
    // מכיוון שאין API חיצוני סטנדרטי למנויים, נשאיר פונקציה ריקה
    // או נוכל להשתמש בה כפונקציית עזר עתידית
    return [];
};

// יצירת מנוי חדש
const createSubscription = async (subscriptionData) => {
    try {
        const { memberId, movies } = subscriptionData;

        // בדוק שהחבר קיים
        const member = await Member.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        // בדוק שכל הסרטים קיימים
        const movieIds = movies.map(movie => movie.movieId);
        const existingMovies = await Movie.find({ _id: { $in: movieIds } });
        
        if (existingMovies.length !== movieIds.length) {
            throw new Error('One or more movies do not exist');
        }

        // בדוק אם כבר יש מנוי לחבר זה
        let subscription = await Subscription.findOne({ memberId });

        if (subscription) {
            // הוסף סרטים חדשים למנוי קיים
            subscription.movies.push(...movies);
        } else {
            // צור מנוי חדש
            subscription = new Subscription({ memberId, movies });
        }

        await subscription.save();
        return subscription;
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
};

// קבלת מנויים של חבר
const getMemberSubscriptions = async (memberId) => {
    try {
        const subscriptions = await Subscription.findOne({ memberId })
            .populate('movies.movieId', 'name genres');

        if (!subscriptions) {
            return [];
        }

        return subscriptions.movies;
    } catch (error) {
        console.error('Error fetching member subscriptions:', error);
        throw error;
    }
};

module.exports = {
    fetchSubscriptionsFromAPI,
    createSubscription,
    getMemberSubscriptions
};