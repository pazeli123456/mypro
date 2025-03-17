const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Movie = require('../models/Movie');
const Member = require('../models/Member');
const subscriptionService = require('../services/subscriptionService');
const { checkPermission } = require('../configs/authMiddleware');

// יצירת מנוי חדש
router.post('/', checkPermission('Create Subscriptions'), async (req, res) => {
    try {
        const { memberId, movies } = req.body;

        // אימות קלט
        if (!memberId || !movies || !Array.isArray(movies)) {
            return res.status(400).json({ 
                error: 'Member ID and movies array are required' 
            });
        }

        // וודא שהחבר קיים
        const memberExists = await Member.findById(memberId);
        if (!memberExists) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // וודא שכל הסרטים קיימים
        const movieIds = movies.map(movie => movie.movieId);
        const existingMovies = await Movie.find({ _id: { $in: movieIds } });
        
        if (existingMovies.length !== movieIds.length) {
            return res.status(400).json({ error: 'One or more movies do not exist' });
        }

        // השתמש בשירות ליצירת מנוי
        const subscription = await subscriptionService.createSubscription({ memberId, movies });

        res.status(201).json({ 
            message: 'Subscription created/updated successfully', 
            subscription 
        });
    } catch (err) {
        console.error('Subscription creation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// שליפת כל המנויים
router.get('/', checkPermission('View Subscriptions'), async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('memberId', 'name email')
            .populate('movies.movieId', 'name genres');
        res.json(subscriptions);
    } catch (err) {
        console.error('Fetch subscriptions error:', err);
        res.status(500).json({ error: err.message });
    }
});

// שליפת מנוי לפי ID חבר
router.get('/member/:id', checkPermission('View Subscriptions'), async (req, res) => {
    try {
        const memberId = req.params.id;
        
        // השתמש בשירות לשליפת מנויי חבר
        const memberSubscriptions = await subscriptionService.getMemberSubscriptions(memberId);

        if (memberSubscriptions.length === 0) {
            return res.status(404).json({ error: 'No subscriptions found for this member' });
        }

        res.json(memberSubscriptions);
    } catch (err) {
        console.error('Fetch member subscriptions error:', err);
        res.status(500).json({ error: err.message });
    }
});

// עדכון מנוי
router.put('/:id', checkPermission('Update Subscriptions'), async (req, res) => {
    try {
        const { movies } = req.body;

        // אימות קלט
        if (!movies || !Array.isArray(movies)) {
            return res.status(400).json({ error: 'Movies array is required' });
        }

        // וודא שכל הסרטים קיימים
        const movieIds = movies.map(movie => movie.movieId);
        const existingMovies = await Movie.find({ _id: { $in: movieIds } });
        
        if (existingMovies.length !== movieIds.length) {
            return res.status(400).json({ error: 'One or more movies do not exist' });
        }

        // עדכון המנוי
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id, 
            { movies }, 
            { new: true, runValidators: true }
        ).populate('movies.movieId', 'name');

        if (!updatedSubscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json({
            message: 'Subscription updated successfully',
            subscription: updatedSubscription
        });
    } catch (err) {
        console.error('Update subscription error:', err);
        res.status(500).json({ error: err.message });
    }
});

// מחיקת מנוי
router.delete('/:id', checkPermission('Delete Subscriptions'), async (req, res) => {
    try {
        const deletedSubscription = await Subscription.findByIdAndDelete(req.params.id);
        
        if (!deletedSubscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.status(200).json({ 
            message: `Subscription with ID ${req.params.id} deleted successfully`,
            deletedSubscription
        });
    } catch (err) {
        console.error('Delete subscription error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;