const { readJSON, writeJSON } = require('./fileService');
const path = require('path');

// שליפת הרשאות למשתמש לפי ID
const getPermissionsByUserId = async (userId) => {
    try {
        const permissions = await readJSON('Permissions.json');
        const userPermissions = permissions.find(p => p.id === userId);
        return userPermissions || null;
    } catch (err) {
        console.error('Error getting permissions:', err.message);
        throw new Error('Failed to retrieve user permissions');
    }
};

// עדכון הרשאות למשתמש
const updatePermissions = async (userId, newPermissions) => {
    try {
        const permissions = await readJSON('Permissions.json');
        const userIndex = permissions.findIndex(p => p.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // עדכון הרשאות
        permissions[userIndex].permissions = newPermissions;

        // שמירת השינויים
        await writeJSON('Permissions.json', permissions);

        return permissions[userIndex];
    } catch (err) {
        console.error('Error updating permissions:', err.message);
        throw err;
    }
};

module.exports = {
    getPermissionsByUserId,
    updatePermissions
};