const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const JWT_SECRET = 'your_jwt_secret_key'; // שנה למשהו מאובטח יותר

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { userId: user._id, userName: user.userName },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            token,
            userId: user._id,
            userName: user.userName,
            permissions: user.permissions || []
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/create-account', async (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            userName,
            password: hashedPassword,
            permissions: [
                'View Movies',
                'View Subscriptions'
            ]
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'User created successfully',
            userId: newUser._id 
        });
    } catch (err) {
        console.error('Create account error:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;