const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { generalLimiter, authLimiter, apiLimiter } = require('./middleware/rate-limit');
const injectionProtection = require('./middleware/injection-protection');

// הגנה בסיסית


// טעינת משתני סביבה
dotenv.config();

// Import routes
const testRoutes = require('./controllers/testController');
const movieRoutes = require('./controllers/movieController');
const memberRoutes = require('./controllers/memberController');
const userRoutes = require('./controllers/userController');
const authRoutes = require('./controllers/authController');
const subscriptionRoutes = require('./controllers/subscriptionController');
const permissionRoutes = require('./controllers/permissionController');

// Import middleware
const { authenticateToken, checkPermission, checkAdmin } = require('./configs/authMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'UserID'],
}));
app.use(bodyParser.json());
app.use(injectionProtection);
app.use(helmet());
app.use(generalLimiter);

// הגבלת קצב ספציפית לנתיבים
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
    message: 'Too many requests, please try again later'
});
app.use(limiter);

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', authenticateToken, checkPermission('View Movies'), movieRoutes);
app.use('/api/members', authenticateToken, checkPermission('View Members'), memberRoutes);
app.use('/api/users', authenticateToken, checkAdmin, userRoutes);
app.use('/api/subscription-service', authenticateToken, subscriptionRoutes);
app.use('/api/subscriptions', authenticateToken, checkPermission('View Subscriptions'), subscriptionRoutes);
app.use('/api/permissions', authenticateToken, checkAdmin, permissionRoutes);
app.use('/api/test', testRoutes);


// Base route
app.get('/', (req, res) => {
    res.send('Cinema Management Backend is running!');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cinema_management';
mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;