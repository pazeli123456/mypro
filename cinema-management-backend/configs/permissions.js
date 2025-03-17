const fs = require('fs');
const path = require('path');

// Path to the permissions JSON file
const permissionsFilePath = path.join(__dirname, '../data/Permissions.json');

// Load permissions from the file
const loadPermissions = () => {
    if (!fs.existsSync(permissionsFilePath)) {
        fs.writeFileSync(permissionsFilePath, JSON.stringify([])); // Create an empty file if it doesn't exist
    }
    return JSON.parse(fs.readFileSync(permissionsFilePath, 'utf8'));
};

// Save permissions to the file
const savePermissions = (permissions) => {
    fs.writeFileSync(permissionsFilePath, JSON.stringify(permissions, null, 2));
};

// Add default permissions for a user
const addUserPermissions = (userId) => {
    const permissions = loadPermissions();

    if (!permissions.some((p) => p.id === userId)) {
        permissions.push({
            id: userId,
            permissions: ['View Movies'], // Default permissions
        });

        savePermissions(permissions);
        console.log(`Added default permissions for user: ${userId}`);
    }
};

// Check if a user has a specific permission
const hasPermission = (userId, permission) => {
    const permissions = loadPermissions();
    const userPermissions = permissions.find((p) => p.id === userId);
    return userPermissions && userPermissions.permissions.includes(permission);
};

module.exports = {
    addUserPermissions,
    hasPermission,
    loadPermissions,
    savePermissions,
};
