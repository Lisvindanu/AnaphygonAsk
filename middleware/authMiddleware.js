// middleware/authMiddleware.js
const userModel = require('../models/userModel');

class AuthMiddleware {
    // Check if user is authenticated
    static requireAuth(req, res, next) {
        const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

        if (!sessionId) {
            // Redirect to login for web requests
            if (req.headers.accept?.includes('text/html')) {
                return res.redirect('/auth/login');
            }

            // JSON response for API requests
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                redirect: '/auth/login'
            });
        }

        const user = userModel.getUserBySession(sessionId);
        if (!user) {
            // Clear invalid cookie
            res.clearCookie('sessionId');

            if (req.headers.accept?.includes('text/html')) {
                return res.redirect('/auth/login');
            }

            return res.status(401).json({
                success: false,
                message: 'Session expired',
                redirect: '/auth/login'
            });
        }

        req.user = user;
        next();
    }

    // Check if user can chat (has remaining quota)
    static checkChatLimit(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const chatCheck = userModel.canUserChat(req.user.id);
        if (!chatCheck.canChat) {
            return res.status(429).json({
                success: false,
                message: `🚫 **Limit Chat Harian Tercapai**\n\nAnda telah menggunakan ${chatCheck.usage}/${chatCheck.limit} chat hari ini.\n\n**Reset otomatis besok pukul 00:00**\n\nJika perlu limit lebih tinggi, hubungi admin.`,
                usage: chatCheck.usage,
                limit: chatCheck.limit,
                type: 'chat_limit_exceeded',
                suggestions: [
                    'Tunggu hingga besok untuk reset otomatis',
                    'Hubungi admin untuk menaikkan limit',
                    'Gunakan pertanyaan yang lebih efisien'
                ]
            });
        }

        req.chatQuota = chatCheck;
        next();
    }

    // Optional auth (for guest access or mixed pages)
    static optionalAuth(req, res, next) {
        const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

        if (sessionId) {
            const user = userModel.getUserBySession(sessionId);
            if (user) {
                req.user = user;
            }
        }

        next();
    }

    // Check if user is admin (simplified - not needed for 2-user setup but kept for future)
    static requireAdmin(req, res, next) {
        if (!req.user || req.user.role !== 'admin') {
            if (req.headers.accept?.includes('text/html')) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'Admin access required',
                    user: req.user || null
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        next();
    }

    // Rate limiting for login attempts (simple implementation)
    static loginRateLimit(req, res, next) {
        const ip = req.ip;
        const now = Date.now();

        // Simple in-memory rate limiting for login
        if (!AuthMiddleware._loginAttempts) {
            AuthMiddleware._loginAttempts = new Map();
        }

        const attempts = AuthMiddleware._loginAttempts.get(ip) || [];

        // Remove attempts older than 15 minutes
        const validAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);

        if (validAttempts.length >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
                type: 'rate_limit'
            });
        }

        // Add current attempt
        validAttempts.push(now);
        AuthMiddleware._loginAttempts.set(ip, validAttempts);

        next();
    }

    // Clear login rate limit on successful login
    static clearLoginAttempts(req) {
        if (AuthMiddleware._loginAttempts) {
            AuthMiddleware._loginAttempts.delete(req.ip);
        }
    }

    // Get user info for templates
    static addUserToLocals(req, res, next) {
        res.locals.user = req.user || null;
        res.locals.isAuthenticated = !!req.user;

        if (req.user) {
            const chatQuota = userModel.canUserChat(req.user.id);
            res.locals.chatQuota = chatQuota;
        }

        next();
    }

    // Session cleanup middleware (run periodically)
    static cleanupExpiredSessions() {
        try {
            const now = new Date();
            let cleaned = 0;

            for (const [sessionId, session] of userModel.sessions.entries()) {
                if (new Date(session.expiresAt) < now || !session.isActive) {
                    userModel.sessions.delete(sessionId);
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                userModel.saveSessions();
                console.log(`🧹 Cleaned ${cleaned} expired sessions`);
            }
        } catch (error) {
            console.error('Session cleanup error:', error);
        }
    }
}

// Initialize session cleanup (run every hour)
setInterval(() => {
    AuthMiddleware.cleanupExpiredSessions();
}, 60 * 60 * 1000);

module.exports = AuthMiddleware;