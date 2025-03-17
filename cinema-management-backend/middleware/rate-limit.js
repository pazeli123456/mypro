const rateLimit = require('express-rate-limit');

const createLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return rateLimit({
        windowMs: windowMs,
        max: maxRequests,
        message: {
            status: 'error',
            message: 'יותר מדי בקשות, אנא נסה שוב מאוחר יותר'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                status: 'error',
                message: 'יותר מדי בקשות, אנא נסה שוב מאוחר יותר'
            });
        },
        keyGenerator: (req) => {
            // משתמשים ב-IP וב-path כדי להגביל לפי סוג בקשה
            return `${req.ip}-${req.path}`;
        },
        skip: (req) => {
            // לא מגבילים בקשות verify-token
            return req.path === '/api/auth/verify-token';
        }
    });
};

module.exports = {
    // מגביל כללי - 100 בקשות ל-15 דקות
    generalLimiter: createLimiter(100, 15 * 60 * 1000),
    
    // מגביל להתחברות - 20 בקשות לדקה
    authLimiter: createLimiter(20, 60 * 1000),
    
    // מגביל ל-API - 300 בקשות ל-15 דקות
    apiLimiter: createLimiter(300, 15 * 60 * 1000)
};