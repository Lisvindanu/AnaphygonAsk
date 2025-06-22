/**
 * MAXIMIZED Rate Limiter & Security Middleware
 * Complete implementation for AnaphygonAsk
 */

const config = require('../config/config');

// ================================================================
// RATE LIMITER CLASS
// ================================================================
class MaximizedRateLimiter {
    constructor() {
        this.requests = new Map();
        this.blacklist = new Set();
        this.stats = {
            totalRequests: 0,
            blockedRequests: 0,
            startTime: Date.now()
        };

        // Configuration with fallback defaults
        this.config = this.getConfig();
        this.windowMs = this.config.windowMs;
        this.maxRequests = this.config.maxRequests;

        // Cleanup old entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);

        console.log('🛡️  MAXIMIZED Rate Limiter initialized:', {
            windowMs: this.windowMs,
            maxRequests: this.maxRequests
        });
    }

    getConfig() {
        // Try to get config from various sources with fallbacks
        try {
            if (config.APP_CONFIG && config.APP_CONFIG.rateLimiting) {
                return config.APP_CONFIG.rateLimiting;
            }
            if (config.getRateLimitConfig && typeof config.getRateLimitConfig === 'function') {
                return config.getRateLimitConfig();
            }
        } catch (err) {
            console.warn('⚠️  Config not available, using defaults:', err.message);
        }

        // Fallback defaults
        return {
            windowMs: 60 * 1000,  // 1 minute
            maxRequests: 15       // 15 requests per minute
        };
    }

    middleware() {
        return (req, res, next) => {
            const clientId = this.getClientId(req);
            const now = Date.now();

            this.stats.totalRequests++;

            // Check blacklist
            if (this.blacklist.has(clientId)) {
                this.stats.blockedRequests++;
                return this.sendRateLimitResponse(req, res, 'BLACKLISTED', 429);
            }

            // Get or create client data
            if (!this.requests.has(clientId)) {
                this.requests.set(clientId, {
                    requests: [],
                    firstRequest: now,
                    totalRequests: 0,
                    lastRequest: now
                });
            }

            const clientData = this.requests.get(clientId);

            // Remove old requests outside window
            clientData.requests = clientData.requests.filter(
                timestamp => now - timestamp < this.windowMs
            );

            // Check if limit exceeded
            if (clientData.requests.length >= this.maxRequests) {
                this.stats.blockedRequests++;

                // Progressive penalties for abuse
                const violationCount = clientData.totalRequests - this.maxRequests;
                if (violationCount > 10) {
                    this.blacklist.add(clientId);
                    setTimeout(() => this.blacklist.delete(clientId), 10 * 60 * 1000);

                    console.warn(`🚫 Client ${clientId} temporarily blacklisted`);
                    return this.sendRateLimitResponse(req, res, 'BLACKLISTED', 429);
                }

                return this.sendRateLimitResponse(req, res, 'RATE_LIMITED', 429);
            }

            // Record this request
            clientData.requests.push(now);
            clientData.totalRequests++;
            clientData.lastRequest = now;

            // Set rate limit headers
            this.setRateLimitHeaders(res, clientData);

            next();
        };
    }

    getClientId(req) {
        // Get IP with fallbacks
        const ip = req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
            'unknown';

        const userAgent = req.get('User-Agent') || 'unknown';

        // Simple fingerprint
        const fingerprint = Buffer.from(`${ip}_${userAgent}`)
            .toString('base64')
            .substring(0, 16);

        return `${ip}_${fingerprint}`;
    }

    setRateLimitHeaders(res, clientData) {
        const remaining = Math.max(0, this.maxRequests - clientData.requests.length);
        const resetTime = clientData.requests.length > 0 ?
            Math.ceil((clientData.requests[0] + this.windowMs) / 1000) :
            Math.ceil((Date.now() + this.windowMs) / 1000);

        res.set({
            'X-RateLimit-Limit': this.maxRequests,
            'X-RateLimit-Remaining': remaining,
            'X-RateLimit-Reset': resetTime,
            'X-RateLimit-Window': this.windowMs
        });
    }

    sendRateLimitResponse(req, res, reason, statusCode) {
        const clientId = this.getClientId(req);
        const resetTime = Math.ceil(Date.now() / 1000) + Math.ceil(this.windowMs / 1000);

        const message = reason === 'BLACKLISTED' ?
            'Akses sementara dibatasi karena penggunaan berlebihan. Silakan tunggu 10 menit.' :
            `Terlalu banyak permintaan! Anda telah mencapai batas ${this.maxRequests} permintaan per menit. Tunggu sebentar lalu coba lagi.`;

        // Set headers even for blocked requests
        res.set({
            'X-RateLimit-Limit': this.maxRequests,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': resetTime,
            'Retry-After': Math.ceil(this.windowMs / 1000)
        });

        console.warn(`🚫 Rate limit exceeded: ${clientId} (${reason})`);

        res.status(statusCode).json({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: message,
            details: {
                limit: this.maxRequests,
                window: this.windowMs,
                resetTime: resetTime,
                resetIn: Math.max(0, resetTime - Math.floor(Date.now() / 1000)),
                reason: reason
            },
            suggestions: [
                'Tunggu hingga rate limit reset',
                'Kurangi frekuensi permintaan',
                'Refresh halaman jika diperlukan'
            ]
        });
    }

    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [clientId, data] of this.requests.entries()) {
            if (now - data.lastRequest > this.windowMs * 5) {
                this.requests.delete(clientId);
                cleaned++;
            } else {
                // Clean old requests from active clients
                data.requests = data.requests.filter(
                    timestamp => now - timestamp < this.windowMs
                );
            }
        }

        const debugMode = config.DEBUG_MODE || process.env.NODE_ENV !== 'production';
        if (cleaned > 0 && debugMode) {
            console.log(`🧹 Cleaned ${cleaned} inactive rate limit entries`);
        }
    }

    getStats() {
        const uptime = Date.now() - this.stats.startTime;

        return {
            uptime: Math.floor(uptime / 1000),
            totalRequests: this.stats.totalRequests,
            blockedRequests: this.stats.blockedRequests,
            blockRate: this.stats.totalRequests > 0 ?
                (this.stats.blockedRequests / this.stats.totalRequests * 100).toFixed(2) + '%' :
                '0%',
            activeClients: this.requests.size,
            blacklistedClients: this.blacklist.size,
            requestsPerSecond: this.stats.totalRequests > 0 ?
                (this.stats.totalRequests / (uptime / 1000)).toFixed(2) : '0',
            configuration: {
                maxRequests: this.maxRequests,
                windowMs: this.windowMs,
                windowMinutes: this.windowMs / (60 * 1000)
            }
        };
    }

    resetClient(clientId) {
        this.requests.delete(clientId);
        this.blacklist.delete(clientId);
        console.log(`🔓 Rate limit reset for client: ${clientId}`);
    }

    isHealthy() {
        return {
            healthy: true,
            activeClients: this.requests.size,
            blacklistedClients: this.blacklist.size,
            memoryUsage: process.memoryUsage().heapUsed,
            uptime: Date.now() - this.stats.startTime
        };
    }
}

// ================================================================
// SECURITY MIDDLEWARE CLASS
// ================================================================
class MaximizedSecurity {
    constructor() {
        this.suspiciousPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /data:text\/html/gi,
            /vbscript:/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /<object[^>]*>.*?<\/object>/gi,
            /<embed[^>]*>.*?<\/embed>/gi
        ];

        console.log('🛡️  MAXIMIZED Security middleware initialized');
    }

    securityHeaders() {
        return (req, res, next) => {
            // Comprehensive security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

            // Content Security Policy
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
        };
    }

    validateRequest() {
        return (req, res, next) => {
            // Check request size
            const contentLength = parseInt(req.get('content-length') || '0');
            if (contentLength > 10 * 1024 * 1024) { // 10MB limit
                return res.status(413).json({
                    success: false,
                    error: 'PAYLOAD_TOO_LARGE',
                    message: 'Request payload too large'
                });
            }

            // Validate User-Agent
            const userAgent = req.get('User-Agent');
            if (!userAgent || userAgent.length < 5) {
                console.warn('🚨 Suspicious request without proper User-Agent:', req.ip);
            }

            // Check for common attack patterns in URL
            const suspiciousUrlPatterns = [
                /\.\./,
                /\/etc\/passwd/,
                /\/proc\/self/,
                /<script/i,
                /javascript:/i
            ];

            for (const pattern of suspiciousUrlPatterns) {
                if (pattern.test(req.url)) {
                    console.warn('🚨 Suspicious URL pattern detected:', req.url);
                    return res.status(400).json({
                        success: false,
                        error: 'INVALID_REQUEST',
                        message: 'Invalid request pattern detected'
                    });
                }
            }

            next();
        };
    }

    sanitizeInput() {
        return (req, res, next) => {
            if (req.body) {
                this.sanitizeObject(req.body);
            }
            if (req.query) {
                this.sanitizeObject(req.query);
            }
            if (req.params) {
                this.sanitizeObject(req.params);
            }
            next();
        };
    }

    sanitizeObject(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'string') {
                    obj[key] = this.sanitizeString(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    this.sanitizeObject(obj[key]);
                }
            }
        }
    }

    sanitizeString(str) {
        if (!str || typeof str !== 'string') return str;

        let sanitized = str;

        // Check for suspicious patterns
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(sanitized)) {
                console.warn('🚨 Suspicious input detected and sanitized:', sanitized.substring(0, 100));
                sanitized = sanitized.replace(pattern, '[REMOVED]');
            }
        }

        // Basic HTML encoding for safety
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');

        return sanitized;
    }
}

// ================================================================
// MONITORING MIDDLEWARE CLASS
// ================================================================
class MaximizedMonitoring {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                averageResponseTime: 0
            },
            errors: new Map(),
            performance: {
                slowRequests: 0,
                fastRequests: 0,
                timeouts: 0
            },
            usage: {
                hourlyStats: new Map()
            }
        };

        this.startTime = Date.now();

        // Cleanup old metrics every hour
        setInterval(() => this.cleanupMetrics(), 60 * 60 * 1000);

        console.log('📊 MAXIMIZED Monitoring middleware initialized');
    }

    requestMonitoring() {
        return (req, res, next) => {
            const startTime = Date.now();
            const monitoringInstance = this; // FIXED: Capture the monitoring instance

            // Track request
            this.metrics.requests.total++;
            this.updateHourlyStats();

            // Override res.json to capture response
            const originalJson = res.json;
            res.json = function(data) {
                const responseTime = Date.now() - startTime;

                // FIXED: Update metrics using the captured monitoring instance
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    monitoringInstance.metrics.requests.successful++;
                } else {
                    monitoringInstance.metrics.requests.failed++;
                    monitoringInstance.trackError(res.statusCode, req.path);
                }

                // Update response time
                monitoringInstance.updateResponseTime(responseTime);

                // Track performance
                if (responseTime > 5000) {
                    monitoringInstance.metrics.performance.slowRequests++;
                } else {
                    monitoringInstance.metrics.performance.fastRequests++;
                }

                // Add performance headers
                res.setHeader('X-Response-Time', responseTime + 'ms');
                res.setHeader('X-Request-ID', req.requestId || 'unknown');

                return originalJson.call(res, data); // FIXED: Call with res context
            };

            next();
        };
    }

    trackError(statusCode, path) {
        const errorKey = `${statusCode}_${path}`;
        const current = this.metrics.errors.get(errorKey) || { count: 0, lastSeen: null };

        this.metrics.errors.set(errorKey, {
            count: current.count + 1,
            lastSeen: new Date().toISOString(),
            statusCode: statusCode,
            path: path
        });
    }

    updateResponseTime(responseTime) {
        const total = this.metrics.requests.total;
        const current = this.metrics.requests.averageResponseTime;

        this.metrics.requests.averageResponseTime =
            ((current * (total - 1)) + responseTime) / total;
    }

    updateHourlyStats() {
        const hour = new Date().getHours();
        const current = this.metrics.usage.hourlyStats.get(hour) || 0;
        this.metrics.usage.hourlyStats.set(hour, current + 1);
    }

    cleanupMetrics() {
        // Keep only last 24 hours of hourly stats
        const currentHour = new Date().getHours();
        const keysToDelete = [];

        for (const [hour] of this.metrics.usage.hourlyStats) {
            const hourDiff = Math.abs(currentHour - hour);
            if (hourDiff > 24) {
                keysToDelete.push(hour);
            }
        }

        keysToDelete.forEach(key => this.metrics.usage.hourlyStats.delete(key));

        // Cleanup old errors (keep only last 100)
        if (this.metrics.errors.size > 100) {
            const sorted = Array.from(this.metrics.errors.entries())
                .sort((a, b) => new Date(b[1].lastSeen) - new Date(a[1].lastSeen))
                .slice(0, 100);

            this.metrics.errors.clear();
            sorted.forEach(([key, value]) => this.metrics.errors.set(key, value));
        }

        const debugMode = config.DEBUG_MODE || process.env.NODE_ENV !== 'production';
        if (debugMode) {
            console.log('🧹 Cleaned monitoring metrics');
        }
    }

    getHealthCheck() {
        const uptime = Date.now() - this.startTime;
        const memUsage = process.memoryUsage();

        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: {
                ms: uptime,
                seconds: Math.floor(uptime / 1000),
                minutes: Math.floor(uptime / (1000 * 60)),
                hours: Math.floor(uptime / (1000 * 60 * 60))
            },
            requests: this.metrics.requests,
            performance: this.metrics.performance,
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
                external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
            },
            errors: {
                types: this.metrics.errors.size,
                recent: Array.from(this.metrics.errors.entries())
                    .sort((a, b) => new Date(b[1].lastSeen) - new Date(a[1].lastSeen))
                    .slice(0, 5)
                    .map(([key, data]) => ({
                        error: key,
                        count: data.count,
                        lastSeen: data.lastSeen
                    }))
            },
            usage: {
                currentHour: this.metrics.usage.hourlyStats.get(new Date().getHours()) || 0,
                hourlyDistribution: Object.fromEntries(this.metrics.usage.hourlyStats)
            }
        };
    }

    getPerformanceMetrics() {
        const uptime = Date.now() - this.startTime;

        return {
            responseTime: {
                average: Math.round(this.metrics.requests.averageResponseTime),
                distribution: {
                    fast: this.metrics.performance.fastRequests,
                    slow: this.metrics.performance.slowRequests,
                    timeouts: this.metrics.performance.timeouts
                }
            },
            throughput: {
                requestsPerSecond: uptime > 0 ? (this.metrics.requests.total / (uptime / 1000)).toFixed(2) : '0.00',
                requestsPerMinute: uptime > 0 ? (this.metrics.requests.total / (uptime / (1000 * 60))).toFixed(2) : '0.00'
            },
            reliability: {
                successRate: this.metrics.requests.total > 0 ?
                    (this.metrics.requests.successful / this.metrics.requests.total * 100).toFixed(2) + '%' : '100.00%',
                errorRate: this.metrics.requests.total > 0 ?
                    (this.metrics.requests.failed / this.metrics.requests.total * 100).toFixed(2) + '%' : '0.00%'
            }
        };
    }
}

// ================================================================
// CREATE INSTANCES
// ================================================================
const rateLimiterInstance = new MaximizedRateLimiter();
const securityInstance = new MaximizedSecurity();
const monitoringInstance = new MaximizedMonitoring();

// ================================================================
// EXPORTS
// ================================================================
module.exports = {
    // Main middleware functions
    rateLimiter: rateLimiterInstance.middleware(),

    // Security middleware
    security: {
        securityHeaders: securityInstance.securityHeaders(),
        validateRequest: securityInstance.validateRequest(),
        sanitizeInput: securityInstance.sanitizeInput()
    },

    // Monitoring middleware
    monitoring: {
        requestMonitoring: monitoringInstance.requestMonitoring(),
        getHealthCheck: () => monitoringInstance.getHealthCheck(),
        getPerformanceMetrics: () => monitoringInstance.getPerformanceMetrics()
    },

    // Utility functions
    getStats: () => rateLimiterInstance.getStats(),
    resetClient: (clientId) => rateLimiterInstance.resetClient(clientId),
    isHealthy: () => rateLimiterInstance.isHealthy(),

    // Instance access for advanced usage
    instances: {
        rateLimiter: rateLimiterInstance,
        security: securityInstance,
        monitoring: monitoringInstance
    }
};