// src/utils/errorHandling.js
export class AppError extends Error {
    constructor(message, code, details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
    }
}

export const errorMessages = {
    auth: {
        INVALID_CREDENTIALS: 'שם משתמש או סיסמה שגויים',
        SESSION_EXPIRED: 'פג תוקף החיבור, אנא התחבר מחדש',
        UNAUTHORIZED: 'אין לך הרשאה לבצע פעולה זו',
        FORBIDDEN: 'אין לך הרשאות מתאימות'
    },
    data: {
        NOT_FOUND: 'המידע המבוקש לא נמצא',
        VALIDATION_ERROR: 'נתונים שגויים',
        SERVER_ERROR: 'שגיאת שרת'
    },
    network: {
        CONNECTION_ERROR: 'בעיית תקשורת, אנא בדוק את החיבור לאינטרנט',
        TIMEOUT: 'פג זמן הבקשה, אנא נסה שוב'
    }
};

export const handleApiError = (error) => {
    if (error instanceof AppError) {
        return error;
    }

    if (error.response) {
        // שגיאת שרת עם תגובה
        const status = error.response.status;
        const message = error.response.data?.message || errorMessages.data.SERVER_ERROR;

        switch (status) {
            case 400:
                return new AppError(message || errorMessages.data.VALIDATION_ERROR, 'VALIDATION_ERROR');
            case 401:
                return new AppError(message || errorMessages.auth.UNAUTHORIZED, 'UNAUTHORIZED');
            case 403:
                return new AppError(message || errorMessages.auth.FORBIDDEN, 'FORBIDDEN');
            case 404:
                return new AppError(message || errorMessages.data.NOT_FOUND, 'NOT_FOUND');
            default:
                return new AppError(message || errorMessages.data.SERVER_ERROR, 'SERVER_ERROR');
        }
    }

    if (error.request) {
        // הבקשה נשלחה אך לא התקבלה תשובה
        if (error.code === 'ECONNABORTED') {
            return new AppError(errorMessages.network.TIMEOUT, 'TIMEOUT');
        }
        return new AppError(errorMessages.network.CONNECTION_ERROR, 'CONNECTION_ERROR');
    }

    // שגיאה בהגדרת הבקשה
    return new AppError(error.message || 'שגיאה לא ידועה', 'UNKNOWN_ERROR');
};

export const showErrorNotification = (error) => {
    // כאן תוכל להוסיף לוגיקה להצגת התראות שגיאה
    // למשל באמצעות toast או alert
    console.error('Error:', error.message);
    
    // דוגמה לשימוש בספריית toast
    // toast.error(error.message);
};

export const logError = (error, context = {}) => {
    // לוגיקה לתיעוד שגיאות
    console.error('Error occurred:', {
        message: error.message,
        code: error.code,
        details: error.details,
        context,
        timestamp: new Date().toISOString()
    });
};