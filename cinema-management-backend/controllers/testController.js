const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');

// בדיקת יצירת משתמש חדש
router.post('/users', async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        
        if (!userName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newUser = new User({ 
            userName, 
            email, 
            password,
            permissions: ['View Movies']
        });

        await newUser.save();
        
        res.status(201).json({ 
            message: 'Test user created', 
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error('Test user creation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// בדיקת נתונים בבסיס הנתונים
router.get('/db-status', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const movieCount = await Movie.countDocuments();
        const memberCount = await Member.countDocuments();
        const subscriptionCount = await Subscription.countDocuments();

        res.json({
            users: userCount,
            movies: movieCount,
            members: memberCount,
            subscriptions: subscriptionCount
        });
    } catch (err) {
        console.error('DB status check error:', err);
        res.status(500).json({ error: err.message });
    }
});

// בדיקת יצירת סרט
router.post('/movies', async (req, res) => {
    try {
        const { name, genres, image, premiered } = req.body;
        
        if (!name || !genres || !image || !premiered) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newMovie = new Movie({ name, genres, image, premiered });
        await newMovie.save();
        
        res.status(201).json({ 
            message: 'Test movie created', 
            movie: newMovie 
        });
    } catch (err) {
        console.error('Test movie creation error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;