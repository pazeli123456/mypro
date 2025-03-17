const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { checkPermission, checkAdmin } = require('../configs/authMiddleware');

// שליפת כל המשתמשים
router.get('/', checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// שליפת משתמש לפי ID
router.get('/:id', checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// הוספת משתמש חדש
router.post('/', checkAdmin, async (req, res) => {
    try {
        const { userName, email, password, role, permissions } = req.body;

        // בדיקת תקינות קלט
        if (!userName || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // בדיקה אם משתמש כבר קיים
        const existingUser = await User.findOne({ 
            $or: [{ userName }, { email }] 
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // יצירת משתמש חדש
        const newUser = new User({
            userName,
            email,
            password,
            role: role || 'USER',
            permissions: permissions || ['View Movies']
        });

        await newUser.save();

        // החזרת המשתמש ללא סיסמה
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// עדכון משתמש
router.put('/:id', checkAdmin, async (req, res) => {
    try {
        const { userName, email, firstName, lastName, password, role, permissions, sessionTimeOut } = req.body;
        console.log('Update User Data Received:', req.body);

        // הגדרת אובייקט העדכון עם טיפול בשדות חסרים
        const updateData = {};
        
        // הוספת השדות רק אם הם קיימים בבקשה
        if (userName !== undefined) updateData.userName = userName;
        if (email !== undefined) updateData.email = email;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (role !== undefined) updateData.role = role;
        if (permissions !== undefined) updateData.permissions = permissions;
        if (sessionTimeOut !== undefined) updateData.sessionTimeOut = sessionTimeOut;

        // אם סיסמה סופקה, עדכן אותה
        if (password) {
            updateData.password = password;
        }

        // אם אין מספיק נתונים לעדכון, החזר שגיאה
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User updated successfully:', updatedUser);
        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: err.message });
    }
});

// מחיקת משתמש
router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: `User with ID ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;