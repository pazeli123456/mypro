// src/utils/validationUtils.js

// בדיקת שם משתמש
export const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
};

// בדיקת אימייל
export const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(String(email).toLowerCase());
};

// בדיקת סיסמה
export const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// בדיקת שדות כלליים
export const validateFields = (fields) => {
    const errors = {};
    Object.entries(fields).forEach(([key, value]) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors[key] = `${key} הוא שדה חובה`;
        }
    });
    return errors;
};

// בדיקת תאריך
export const validateDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    return selectedDate <= today;
};

// בדיקת URL תקין
export const validateUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        console.error(`Invalid URL: ${url}`, e);
        return false;
    }
};

// בדיקת שם מלא
export const validateFullName = (name) => {
    return name && name.length >= 2 && name.length <= 50;
};