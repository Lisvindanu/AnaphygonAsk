const express = require('express');
const path = require('path');
const logger = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // ✅ NEW: Cookie parser for sessions

// Load environment variables
dotenv.config();

// Import controllers
const homeController = require('./controllers/homeController');
const chatController = require('./controllers/chatController');
const config = require('./config/config');

// ✅ NEW: Import authentication
const authRoutes = require('./routes/authRoutes');
const AuthMiddleware = require('./middleware/authMiddleware');

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

// ✅ NEW: Cookie parser middleware (before routes)
app.use(cookieParser());

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

// ✅ NEW: Authentication routes
app.use('/auth', authRoutes);

// ✅ UPDATED: Routes with authentication
app.get('/', AuthMiddleware.optionalAuth, homeController.index);
app.get('/chat', AuthMiddleware.requireAuth, chatController.showChat);

// ✅ UPDATED: Chat API with auth and enhanced rate limiting
app.post('/api/chat',
    AuthMiddleware.requireAuth,           // Must be logged in
    AuthMiddleware.checkChatLimit,       // Check daily chat limit
    rateLimiterMiddleware,               // General rate limiting
    chatController.processQuestion
);

// ✅ NEW: User info endpoint
app.get('/api/user', AuthMiddleware.requireAuth, (req, res) => {
    const userModel = require('./models/userModel');
    const chatQuota = userModel.canUserChat(req.user.id);

    res.json({
        success: true,
        user: {
            ...req.user,
            chatQuota
        }
    });
});

// ✅ NEW: Admin endpoints
app.get('/admin', AuthMiddleware.requireAuth, AuthMiddleware.requireAdmin, (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard - Tanya AI',
        user: req.user
    });
});

// MAXIMIZED: Enhanced health and metrics endpoints
app.get('/health', (req, res) => {
    if (chatController.healthCheck && typeof chatController.healthCheck === 'function') {
        chatController.healthCheck(req, res);
    } else {
        // Enhanced fallback health check with auth status
        const userModel = require('./models/userModel');
        const totalUsers = userModel.getAllUsers().length;

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: config.getVersion ? config.getVersion() : '2.0.0',
            mode: config.isMaximizedMode ? config.isMaximizedMode() ? 'maximized' : 'standard' : 'standard',
            // ✅ NEW: Auth system status
            auth: {
                enabled: true,
                totalUsers: totalUsers,
                status: 'operational'
            }
        });
    }
});

app.get('/api/metrics', (req, res) => {
    if (chatController.getMetrics && typeof chatController.getMetrics === 'function') {
        chatController.getMetrics(req, res);
    } else {
        // Enhanced fallback metrics with user stats
        try {
            const userModel = require('./models/userModel');
            const users = userModel.getAllUsers();
            const activeUsers = users.filter(u => {
                const lastLogin = new Date(u.lastLogin);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return lastLogin > dayAgo;
            });

            res.json({
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                message: 'Enhanced metrics not available - using fallback',
                // ✅ NEW: User metrics
                users: {
                    total: users.length,
                    active24h: activeUsers.length,
                    totalChatUsage: users.reduce((sum, u) => sum + (u.dailyUsage || 0), 0)
                }
            });
        } catch (error) {
            res.json({
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                message: 'Enhanced metrics not available - using fallback',
                error: 'User metrics unavailable'
            });
        }
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
            // ✅ UPDATED: Authentication endpoints
            auth: {
                login: 'POST /auth/login',
                register: 'POST /auth/register',
                logout: 'POST /auth/logout',
                userInfo: 'GET /api/user'
            },
            // Original endpoints
            chat: 'POST /api/chat',
            health: 'GET /health',
            metrics: 'GET /api/metrics',
            info: 'GET /api/info'
        },
        features: [
            ...(config.APP_CONFIG ? Object.keys(config.APP_CONFIG.features || {}).filter(
                key => config.APP_CONFIG.features[key]
            ) : []),
            // ✅ NEW: Auth features
            'user_authentication',
            'session_management',
            'daily_chat_limits',
            'admin_panel'
        ],
        limits: {
            maxQuestionLength: config.APP_CONFIG ? config.APP_CONFIG.maxQuestionLength : 2000,
            maxContextItems: config.APP_CONFIG ? config.APP_CONFIG.maxContextItems : 8,
            rateLimitPerMinute: config.APP_CONFIG ?
                (config.APP_CONFIG.rateLimiting ? config.APP_CONFIG.rateLimiting.maxRequests : 15) : 15,
            // ✅ NEW: Chat limits
            defaultDailyChatLimit: 50,
            maxDailyChatLimit: 200
        }
    });
});

// ✅ NEW: Redirect root to appropriate page based on auth status
app.get('/', AuthMiddleware.optionalAuth, (req, res) => {
    if (req.user) {
        // User is logged in, redirect to chat
        res.redirect('/chat');
    } else {
        // User not logged in, show landing page or redirect to login
        try {
            res.render('index', {
                title: 'Tanya AI - Your Smart Assistant',
                user: null
            });
        } catch (error) {
            // If no landing page, redirect to login
            res.redirect('/auth/login');
        }
    }
});

// MAXIMIZED: Enhanced 404 handler
app.use((req, res) => {
    console.log(`📝 404 - Route not found: ${req.method} ${req.url}`);

    // Try to render 404 page, fallback to JSON response
    try {
        res.status(404).render('404', {
            title: 'Page Not Found',
            config: config.APP_CONFIG || { appName: 'AnaphygonAsk' },
            user: req.user || null // ✅ NEW: Pass user info to 404 page
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
                'Login: /auth/login',
                'Register: /auth/register',
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
        user: req.user ? req.user.username : 'anonymous', // ✅ NEW: Include user info
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
    console.log(`🔐 Authentication: ✅ Enabled`); // ✅ NEW
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('├── 🏠 Home: http://localhost:' + PORT + '/');
    console.log('├── 🔐 Login: http://localhost:' + PORT + '/auth/login');
    console.log('├── 📝 Register: http://localhost:' + PORT + '/auth/register');
    console.log('├── 💬 Chat: http://localhost:' + PORT + '/chat');
    console.log('├── 👤 User Info: http://localhost:' + PORT + '/api/user');
    console.log('├── 🔍 Health: http://localhost:' + PORT + '/health');
    console.log('├── 📊 Metrics: http://localhost:' + PORT + '/api/metrics');
    console.log('└── ℹ️  Info: http://localhost:' + PORT + '/api/info');
    console.log('');
    console.log('🔧 Features:');
    const allFeatures = [
        ...(config.APP_CONFIG && config.APP_CONFIG.features ?
            Object.keys(config.APP_CONFIG.features).filter(key => config.APP_CONFIG.features[key]) : []),
        '🔐 User Authentication',
        '📊 Daily Chat Limits',
        '🎫 Session Management',
        '👑 Admin Panel'
    ];
    allFeatures.forEach((feature, index) => {
        const isLast = index === allFeatures.length - 1;
        console.log(`${isLast ? '└──' : '├──'} ${feature}: ✅`);
    });
    console.log('');
    console.log('⏹️  Press Ctrl+C to stop the server');
    console.log('🚀 ════════════════════════════════════════════════════════════\n');

    // ✅ NEW: Initialize first admin user if no users exist
    setTimeout(async () => {
        try {
            const userModel = require('./models/userModel');
            const users = userModel.getAllUsers();

            if (users.length === 0) {
                console.log('🔧 Creating default admin user...');
                const adminResult = await userModel.createUser('admin', 'admin123', 'admin@localhost');
                if (adminResult.success) {
                    // Update to admin role
                    const adminUser = userModel.users.get('admin');
                    adminUser.role = 'admin';
                    adminUser.chatLimit = 200; // Higher limit for admin
                    await userModel.saveUsers();

                    console.log('✅ Default admin created:');
                    console.log('   Username: admin');
                    console.log('   Password: admin123');
                    console.log('   🚨 CHANGE PASSWORD IMMEDIATELY!');
                }
            }
        } catch (error) {
            console.warn('⚠️  Could not create default admin:', error.message);
        }
    }, 1000);
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