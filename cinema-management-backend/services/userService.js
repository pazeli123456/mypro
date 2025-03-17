const fs = require('fs');
const path = require('path');

// Path to the JSON file
const usersFilePath = path.join(__dirname, '../data/Users.json');

// Load users from JSON file
const loadUsers = () => {
    if (!fs.existsSync(usersFilePath)) {
        fs.writeFileSync(usersFilePath, JSON.stringify([])); // Create an empty file if it doesn't exist
    }
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
};

// Save users to JSON file
const saveUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// User service functions
const getAllUsers = () => loadUsers();

const getUserById = (id) => {
    const users = loadUsers();
    return users.find((user) => user.id === id);
};

const createUser = (userData) => {
    const users = loadUsers();

    if (users.some((user) => user.userName === userData.userName)) {
        throw new Error('Username already exists');
    }

    const newUser = { id: Date.now().toString(), ...userData };
    users.push(newUser);
    saveUsers(users);
    return newUser;
};


const updateUser = (id, updatedData) => {
    const users = loadUsers();
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) throw new Error('User not found');

    users[userIndex] = { ...users[userIndex], ...updatedData };
    saveUsers(users);
    return users[userIndex];
};

const deleteUser = (id) => {
    const users = loadUsers();
    const filteredUsers = users.filter((user) => user.id !== id);

    if (filteredUsers.length === users.length) throw new Error('User not found');

    saveUsers(filteredUsers);
    return id;
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
