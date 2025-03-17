const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../Utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

// Utility Functions
const readPermissions = async () => {
    try {
        const filePath = path.join(__dirname, '../data/Permissions.json');
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading Permissions.json:', err);
        return [];
    }
};

const readUsers = async () => {
    try {
        const filePath = path.join(__dirname, '../data/Users.json');
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading Users.json:', err);
        return [];
    }
};

// Route to verify token
router.get('/verify-token', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const permissions = await readPermissions();
        const users = await readUsers();
        
        const user = users.find(u => u.userName === decoded.userName);
        const permissionUser = permissions.find(p => p.userName === decoded.userName);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json({
            userId: user.id,
            userName: user.userName,
            permissions: permissionUser?.permissions || [],
            token
        });
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { userName, password } = req.body;

    try {
        const permissions = await readPermissions();
        const users = await readUsers();

        const permissionUser = permissions.find(
            u => u.userName === userName && u.password === password
        );

        const user = users.find(
            u => u.userName === userName && u.password === password
        );

        const foundUser = permissionUser || user;

        if (!foundUser) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { 
                userId: foundUser.id, 
                userName: foundUser.userName,
                permissions: permissionUser?.permissions || []
            }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({
            token,
            userId: foundUser.id,
            userName: foundUser.userName,
            permissions: permissionUser?.permissions || []
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route - only client-side logout since JWT is stateless
router.post('/logout', (req, res) => {
    // אין צורך לעשות שום דבר בשרת מכיוון ש-JWT היא stateless
    // הלקוח פשוט ימחק את הטוקן במקומי
    res.status(200).json({ message: 'Logged out successfully' });
});

// Create account route
router.post('/create-account', async (req, res) => {
    try {
        const { userName, password, email } = req.body;

        if (!userName || !password || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const users = await readUsers();
        const existingUser = users.find(u => u.userName === userName || u.email === email);
        
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Create new user in Users.json
        const newUser = {
            id: String(users.length + 1),
            userName,
            password, // Note: In production, you should hash the password
            email,
            createdDate: new Date().toISOString(),
            sessionTimeOut: 60
        };

        // Add to Permissions.json
        const permissions = await readPermissions();
        const newPermission = {
            id: String(permissions.length + 1),
            userName,
            permissions: ['View Movies', 'View Subscriptions']
        };

        // Save to files
        await fs.writeFile(
            path.join(__dirname, '../data/Users.json'),
            JSON.stringify([...users, newUser], null, 2)
        );

        await fs.writeFile(
            path.join(__dirname, '../data/Permissions.json'),
            JSON.stringify([...permissions, newPermission], null, 2)
        );

        res.status(201).json({ 
            message: 'User created successfully',
            userId: newUser.id,
            userName: newUser.userName
        });
    } catch (err) {
        console.error('Create account error:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;