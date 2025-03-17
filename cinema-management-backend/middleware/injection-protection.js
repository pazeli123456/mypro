const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

const injectionProtection = (req, res, next) => {
    // סניטציה של כל פרמטרי הבקשה
    const sanitizeInput = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // הסרת תגיות HTML
                obj[key] = sanitizeHtml(obj[key], {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                
                // הימנעות מתווים מיוחדים
                obj[key] = validator.escape(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                // טיפול בערכים מקוננים
                sanitizeInput(obj[key]);
            }
        }
        return obj;
    };

    // סניטציה לכל סוגי הבקשות
    if (req.body) req.body = sanitizeInput({...req.body});
    if (req.params) req.params = sanitizeInput({...req.params});
    if (req.query) req.query = sanitizeInput({...req.query});

    next();
};

module.exports = injectionProtection;