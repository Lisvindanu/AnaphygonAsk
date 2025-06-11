const express = require('express');
const path = require('path');
const logger = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import controllers
const homeController = require('./controllers/homeController');
const chatController = require('./controllers/chatController');
const config = require('./config/config');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3006;

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', true);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' })); // Increased limit for context data
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Import rate limiter after app is initialized
let rateLimiter;
try {
    rateLimiter = require('./middleware/rateLimiter');
} catch (err) {
    console.log('Rate limiter not found, using dummy middleware');
    rateLimiter = (req, res, next) => next(); // Dummy middleware if file doesn't exist
}

// Routes
app.get('/', homeController.index);
app.get('/chat', chatController.showChat);

// Apply rate limiting only to API endpoints
app.post('/api/chat', rateLimiter, chatController.processQuestion);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// 404 handler
app.use((req, res) => {
    // Try to render 404 page, fallback to simple response
    try {
        res.status(404).render('404', {
            title: 'Page Not Found',
            config: config.APP_CONFIG
        });
    } catch (err) {
        res.status(404).json({
            error: 'Page not found',
            message: 'The requested page could not be found.'
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ?
            'Internal server error' :
            err.message
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('⏹️  Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
    }
});

module.exports = app;