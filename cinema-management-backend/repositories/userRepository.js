const User = require('../models/User');

// שליפת כל המשתמשים
const getAllUsers = async () => {
    try {
        return await User.find()
            .select('-password')  // החרג את שדה הסיסמה
            .select('-__v');      // החרג את גרסת המסמך
    } catch (err) {
        console.error('Error fetching users:', err.message);
        throw new Error('Failed to fetch users');
    }
};

// הוספת משתמש חדש
const addUser = async (userData) => {
    try {
        const newUser = new User(userData);
        await newUser.save();

        // החזר את המשתמש ללא סיסמה
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return userResponse;
    } catch (err) {
        console.error('Error adding user:', err.message);
        
        // טיפול בשגיאת כפילות
        if (err.code === 11000) {
            throw new Error('Username or email already exists');
        }
        
        throw new Error('Failed to add user');
    }
};

// עדכון משתמש
const updateUser = async (id, updateData) => {
    try {
        // מנע עדכון סיסמה כאן - יש לעשות זאת דרך שיטה מאובטחת נפרדת
        const { password, ...safeUpdateData } = updateData;

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            safeUpdateData, 
            { 
                new: true,           // החזר את הרשומה המעודכנת
                runValidators: true   // הפעל בדיקות תיקוף
            }
        ).select('-password');  // החרג את שדה הסיסמה

        if (!updatedUser) {
            throw new Error('User not found');
        }

        return updatedUser;
    } catch (err) {
        console.error('Error updating user:', err.message);
        
        // טיפול בשגיאת כפילות
        if (err.code === 11000) {
            throw new Error('Username or email already in use');
        }
        
        throw new Error('Failed to update user');
    }
};

// מחיקת משתמש
const deleteUser = async (id) => {
    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            throw new Error('User not found');
        }

        return {
            message: 'User deleted successfully',
            deletedUserId: id
        };
    } catch (err) {
        console.error('Error deleting user:', err.message);
        throw new Error('Failed to delete user');
    }
};

// מצא משתמש לפי ID
const getUserById = async (id) => {
    try {
        const user = await User.findById(id)
            .select('-password')  // החרג את שדה הסיסמה
            .select('-__v');      // החרג את גרסת המסמך

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (err) {
        console.error('Error finding user:', err.message);
        throw new Error('Failed to find user');
    }
};

module.exports = {
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById
};