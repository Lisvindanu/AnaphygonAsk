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

// MAXIMIZED: Import enhanced middleware (with error handling)
let rateLimiterMiddleware;
let securityMiddleware;
let monitoringMiddleware;

try {
    const middlewareModule = require('./middleware/rateLimiter');
    rateLimiterMiddleware = middlewareModule.rateLimiter || middlewareModule;
    securityMiddleware = middlewareModule.security;
    monitoringMiddleware = middlewareModule.monitoring;

    console.log('✅ MAXIMIZED middleware loaded successfully');
} catch (err) {
    console.warn('⚠️  MAXIMIZED middleware not found, using fallback:', err.message);

    // Fallback middleware
    rateLimiterMiddleware = (req, res, next) => next();
    securityMiddleware = {
        securityHeaders: (req, res, next) => next(),
        validateRequest: (req, res, next) => next()
    };
    monitoringMiddleware = {
        requestMonitoring: (req, res, next) => next()
    };
}

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', true);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MAXIMIZED: Apply enhanced middleware first
if (securityMiddleware && securityMiddleware.securityHeaders) {
    app.use(securityMiddleware.securityHeaders);
}

if (securityMiddleware && securityMiddleware.validateRequest) {
    app.use(securityMiddleware.validateRequest);
}

if (monitoringMiddleware && monitoringMiddleware.requestMonitoring) {
    app.use(monitoringMiddleware.requestMonitoring);
}

// Standard middleware
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' })); // Increased limit for context data
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MAXIMIZED: Enhanced security headers (fallback + additional)
app.use((req, res, next) => {
    // Core security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // MAXIMIZED: Additional security headers
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('X-Powered-By', 'AnaphygonAsk-Maximized');

    // MAXIMIZED: Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://generativelanguage.googleapis.com",
        "frame-ancestors 'none'",
        "base-uri 'self'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', csp);

    next();
});

// MAXIMIZED: Request ID generator for tracking
app.use((req, res, next) => {
    req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    res.setHeader('X-Request-ID', req.requestId);
    next();
});

// Routes
app.get('/', homeController.index);
app.get('/chat', chatController.showChat);

// MAXIMIZED: Apply rate limiting to API endpoints
app.post('/api/chat', rateLimiterMiddleware, chatController.processQuestion);

// MAXIMIZED: Enhanced health and metrics endpoints
app.get('/health', (req, res) => {
    if (chatController.healthCheck && typeof chatController.healthCheck === 'function') {
        chatController.healthCheck(req, res);
    } else {
        // Fallback health check
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: config.getVersion ? config.getVersion() : '2.0.0',
            mode: config.isMaximizedMode ? config.isMaximizedMode() ? 'maximized' : 'standard' : 'standard'
        });
    }
});

app.get('/api/metrics', (req, res) => {
    if (chatController.getMetrics && typeof chatController.getMetrics === 'function') {
        chatController.getMetrics(req, res);
    } else {
        // Fallback metrics
        res.json({
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            message: 'Enhanced metrics not available - using fallback'
        });
    }
});

// MAXIMIZED: API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'AnaphygonAsk API',
        version: config.getVersion ? config.getVersion() : '2.0.0',
        mode: config.isMaximizedMode ? config.isMaximizedMode() ? 'maximized' : 'standard' : 'standard',
        timestamp: new Date().toISOString(),
        endpoints: {
            chat: 'POST /api/chat',
            health: 'GET /health',
            metrics: 'GET /api/metrics',
            info: 'GET /api/info'
        },
        features: config.APP_CONFIG ? Object.keys(config.APP_CONFIG.features || {}).filter(
            key => config.APP_CONFIG.features[key]
        ) : [],
        limits: {
            maxQuestionLength: config.APP_CONFIG ? config.APP_CONFIG.maxQuestionLength : 2000,
            maxContextItems: config.APP_CONFIG ? config.APP_CONFIG.maxContextItems : 8,
            rateLimitPerMinute: config.APP_CONFIG ?
                (config.APP_CONFIG.rateLimiting ? config.APP_CONFIG.rateLimiting.maxRequests : 15) : 15
        }
    });
});

// MAXIMIZED: Enhanced 404 handler
app.use((req, res) => {
    console.log(`📝 404 - Route not found: ${req.method} ${req.url}`);

    // Try to render 404 page, fallback to JSON response
    try {
        res.status(404).render('404', {
            title: 'Page Not Found',
            config: config.APP_CONFIG || { appName: 'AnaphygonAsk' }
        });
    } catch (err) {
        console.warn('404 page render failed, using JSON response:', err.message);
        res.status(404).json({
            success: false,
            error: 'PAGE_NOT_FOUND',
            message: 'The requested page could not be found.',
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
            suggestions: [
                'Check the URL for typos',
                'Visit the home page: /',
                'Try the chat page: /chat',
                'Check API documentation: /api/info'
            ]
        });
    }
});

// MAXIMIZED: Enhanced global error handler
app.use((err, req, res, next) => {
    const errorId = Date.now().toString(36);

    console.error(`🚨 [${errorId}] Global error handler:`, {
        message: err.message,
        stack: config.DEBUG_MODE ? err.stack : 'Stack trace hidden in production',
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    });

    // MAXIMIZED: Structured error response
    const errorResponse = {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' ?
            'Terjadi kesalahan sistem internal. Tim teknis telah diberitahu.' :
            err.message,
        errorId: errorId,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    };

    // Add debug info in development
    if (config.DEBUG_MODE) {
        errorResponse.debug = {
            stack: err.stack,
            name: err.name,
            code: err.code
        };
    }

    // Add helpful suggestions
    errorResponse.suggestions = [
        'Refresh halaman dan coba lagi',
        'Periksa koneksi internet Anda',
        'Coba lagi dalam beberapa menit',
        `Laporkan error ID ${errorId} jika masalah berlanjut`
    ];

    res.status(err.status || 500).json(errorResponse);
});

// MAXIMIZED: Enhanced graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);

    server.close((err) => {
        if (err) {
            console.error('❌ Error during server shutdown:', err);
            process.exit(1);
        }

        console.log('✅ Server closed successfully');
        console.log('👋 Goodbye!');
        process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('⏰ Forced shutdown due to timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// MAXIMIZED: Enhanced server startup
const server = app.listen(PORT, () => {
    console.log('\n🚀 ════════════════════════════════════════════════════════════');
    console.log('🎯 ANAPHYGONASK SERVER STARTED');
    console.log('🚀 ════════════════════════════════════════════════════════════');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Mode: ${config.isMaximizedMode ? config.isMaximizedMode() ? 'MAXIMIZED' : 'Standard' : 'Standard'}`);
    console.log(`📝 Version: ${config.getVersion ? config.getVersion() : '2.0.0'}`);
    console.log(`🔑 API Key: ${config.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('├── 🏠 Home: http://localhost:' + PORT + '/');
    console.log('├── 💬 Chat: http://localhost:' + PORT + '/chat');
    console.log('├── 🔍 Health: http://localhost:' + PORT + '/health');
    console.log('├── 📊 Metrics: http://localhost:' + PORT + '/api/metrics');
    console.log('└── ℹ️  Info: http://localhost:' + PORT + '/api/info');
    console.log('');
    console.log('🔧 Features:');
    if (config.APP_CONFIG && config.APP_CONFIG.features) {
        const enabledFeatures = Object.keys(config.APP_CONFIG.features)
            .filter(key => config.APP_CONFIG.features[key]);
        enabledFeatures.forEach((feature, index) => {
            const isLast = index === enabledFeatures.length - 1;
            console.log(`${isLast ? '└──' : '├──'} ${feature}: ✅`);
        });
    }
    console.log('');
    console.log('⏹️  Press Ctrl+C to stop the server');
    console.log('🚀 ════════════════════════════════════════════════════════════\n');
});

// MAXIMIZED: Enhanced server error handling
server.on('error', (err) => {
    console.error('\n❌ ═══════════════════════════════════════════════════════════');
    console.error('🚨 SERVER ERROR');
    console.error('❌ ═══════════════════════════════════════════════════════════');

    if (err.code === 'EADDRINUSE') {
        console.error(`💥 Port ${PORT} is already in use!`);
        console.error('');
        console.error('🔧 Solutions:');
        console.error('├── Change PORT in .env file');
        console.error('├── Kill process using port:', `lsof -ti:${PORT} | xargs kill -9`);
        console.error('└── Use different port: PORT=3007 node app.js');
        console.error('');
        process.exit(1);
    } else if (err.code === 'EACCES') {
        console.error(`🔐 Permission denied for port ${PORT}`);
        console.error('💡 Try using a port number > 1024 or run with sudo');
        process.exit(1);
    } else {
        console.error('💥 Unexpected server error:', err.message);
        console.error('📝 Full error:', err);
        process.exit(1);
    }
});

// MAXIMIZED: Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('\n💥 Uncaught Exception:', err.message);
    console.error('📝 Stack:', err.stack);
    console.error('🛑 Server will shut down...');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n💥 Unhandled Rejection at:', promise);
    console.error('📝 Reason:', reason);
    console.error('⚠️  Consider handling this promise rejection');
});

module.exports = app;