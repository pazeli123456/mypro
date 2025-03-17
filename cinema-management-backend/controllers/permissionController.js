const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { checkAdmin } = require('../configs/authMiddleware');

// רשימת הרשאות אפשריות
const ALL_PERMISSIONS = [
    'View Movies', 'Create Movies', 'Update Movies', 'Delete Movies',
    'View Subscriptions', 'Create Subscriptions', 'Update Subscriptions', 'Delete Subscriptions',
    'View Members', 'Create Members', 'Update Members', 'Delete Members',
    'Manage Users'
];

// שליפת הרשאות למשתמש
router.get('/:userId', checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('userName permissions role');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: user._id,
            userName: user.userName,
            role: user.role,
            permissions: user.permissions,
            availablePermissions: ALL_PERMISSIONS
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// עדכון הרשאות למשתמש
router.put('/:userId', checkAdmin, async (req, res) => {
    try {
        const { permissions, role } = req.body;

        // אימות תקינות קלט
        if (!Array.isArray(permissions)) {
            return res.status(400).json({ error: 'Permissions must be an array' });
        }

        // בדוק שכל ההרשאות חוקיות
        const invalidPermissions = permissions.filter(
            perm => !ALL_PERMISSIONS.includes(perm)
        );

        if (invalidPermissions.length > 0) {
            return res.status(400).json({ 
                error: 'Invalid permissions',
                invalidPermissions 
            });
        }

        // עדכון אוטומטי של הרשאות משניות
        if (permissions.includes('Create Movies')) {
            if (!permissions.includes('View Movies')) {
                permissions.push('View Movies');
            }
        }

        if (permissions.includes('Create Subscriptions')) {
            if (!permissions.includes('View Subscriptions')) {
                permissions.push('View Subscriptions');
            }
        }

        // עדכון המשתמש
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId, 
            { 
                permissions, 
                role: role || 'USER' 
            }, 
            { 
                new: true, 
                runValidators: true 
            }
        ).select('userName permissions role');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Permissions updated successfully',
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// קבלת רשימת כל ההרשאות האפשריות
router.get('/available/list', checkAdmin, (req, res) => {
    res.json({ availablePermissions: ALL_PERMISSIONS });
});

module.exports = router;