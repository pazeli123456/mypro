const winston = require('winston');
const path = require('path');

// יצירת תיקייה ללוגים אם לא קיימת
const logDir = path.join(__dirname, '../logs');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'cinema-management' },
    transports: [
        // לוג שגיאות
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        // לוג כללי
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log')
        }),
        // הדפסה לקונסולה בסביבת פיתוח
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
    exitOnError: false
});

// אם אנחנו לא בסביבת פיתוח, לא נדפיס ללוג
if (process.env.NODE_ENV !== 'development') {
    logger.remove(logger.transports.find(t => t.name === 'console'));
}

module.exports = logger;