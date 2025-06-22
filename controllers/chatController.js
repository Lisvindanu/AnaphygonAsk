/**
 * MAXIMIZED Chat Controller dengan advanced features - FIXED VERSION
 */
const geminiModel = require('../models/geminiModel');
const config = require('../config/config');

class MaximizedChatController {
    constructor() {
        this.responseCache = new Map(); // Simple response cache
        this.analytics = {
            questionsProcessed: 0,
            averageResponseTime: 0,
            topKeywords: new Map(),
            errorCounts: new Map()
        };

        // MAXIMIZED: Cleanup cache every 30 minutes
        setInterval(() => this.cleanupCache(), 30 * 60 * 1000);

        console.log('🚀 MAXIMIZED Chat Controller initialized');
    }

    // MAXIMIZED: Show chat page with enhanced data
    showChat(req, res) {
        try {
            const enhancedConfig = {
                ...config.APP_CONFIG,
                maximizedMode: config.isMaximizedMode(),
                features: config.APP_CONFIG.features,
                version: config.getVersion(),
                performance: {
                    cacheEnabled: config.isFeatureEnabled('enableResponseCaching'),
                    retryEnabled: config.isFeatureEnabled('enableSmartRetries'),
                    monitoringEnabled: config.isFeatureEnabled('enablePerformanceMonitoring')
                }
            };

            res.render('chat', {
                title: 'Tanya AI - Maximized',
                config: enhancedConfig,
                analytics: this.getPublicAnalytics()
            });

        } catch (error) {
            console.error('Error showing chat page:', error);
            res.status(500).render('error', {
                title: 'Error',
                config: config.APP_CONFIG,
                message: 'Unable to load chat page'
            });
        }
    }

    // MAXIMIZED: Process question with all enhancements
    async processQuestion(req, res) {
        const startTime = Date.now();
        const requestId = req.requestId || 'unknown';

        try {
            if (config.DEBUG_MODE) {
                console.log(`🚀 [${requestId}] MAXIMIZED chat request:`, {
                    questionLength: req.body.question?.length || 0,
                    hasContext: !!req.body.context,
                    contextItems: req.body.context?.length || 0,
                    clientIP: req.ip,
                    timestamp: new Date().toISOString()
                });
            }

            // MAXIMIZED: Enhanced validation
            const validation = this.validateMaximizedRequest(req.body);
            if (!validation.isValid) {
                this.analytics.errorCounts.set('validation_error',
                    (this.analytics.errorCounts.get('validation_error') || 0) + 1);

                return res.status(400).json({
                    success: false,
                    message: validation.message,
                    validationType: validation.type,
                    suggestions: validation.suggestions,
                    requestId: requestId,
                    timestamp: new Date().toISOString()
                });
            }

            const { question, context, mode } = req.body;

            // MAXIMIZED: Check cache first (if enabled)
            if (config.isFeatureEnabled('enableResponseCaching')) {
                const cachedResponse = this.getCachedResponse(question, context);
                if (cachedResponse) {
                    console.log(`⚡ [${requestId}] Cache hit for question`);
                    return res.json({
                        ...cachedResponse,
                        fromCache: true,
                        requestId: requestId,
                        responseTime: Date.now() - startTime
                    });
                }
            }

            // MAXIMIZED: Process context with optimization
            const optimizedContext = this.processMaximizedContext(context);

            // MAXIMIZED: Update analytics
            this.updateAnalytics(question);

            // MAXIMIZED: AI model validation
            const modelValidation = geminiModel.validateQuestion(question);
            if (!modelValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: modelValidation.message,
                    suggestion: modelValidation.suggestion,
                    validationType: 'model_validation',
                    requestId: requestId
                });
            }

            // MAXIMIZED: Smart retry logic
            let response;
            let attempts = 0;
            const maxAttempts = config.isFeatureEnabled('enableSmartRetries') ? 3 : 1;

            while (attempts < maxAttempts) {
                try {
                    response = await geminiModel.askQuestion(question, optimizedContext, mode);
                    break; // Success, exit retry loop
                } catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) throw error;

                    console.log(`🔄 [${requestId}] Retry attempt ${attempts}/${maxAttempts}`);
                    await this.delay(1000 * attempts); // Exponential backoff
                }
            }

            const responseTime = Date.now() - startTime;

            if (response.success) {
                // MAXIMIZED: Cache successful response
                if (config.isFeatureEnabled('enableResponseCaching')) {
                    this.cacheResponse(question, context, response);
                }

                // MAXIMIZED: Update analytics
                this.analytics.questionsProcessed++;
                this.updateAverageResponseTime(responseTime);

                if (config.DEBUG_MODE) {
                    console.log(`✅ [${requestId}] AI response success:`, {
                        responseLength: response.message.length,
                        isFallback: !!response.fallback,
                        responseTime: `${responseTime}ms`,
                        fromCache: false,
                        attempts: attempts
                    });
                }

                return res.json({
                    success: true,
                    message: response.message,
                    metadata: {
                        ...response.metadata,
                        requestId: requestId,
                        responseTime: responseTime,
                        attempts: attempts,
                        fromCache: false,
                        contextUsed: optimizedContext.length,
                        version: 'maximized-v2.0'
                    }
                });

            } else {
                throw new Error(response.message || 'AI response failed');
            }

        } catch (error) {
            const responseTime = Date.now() - startTime;

            console.error(`❌ [${requestId}] Error in processQuestion:`, {
                message: error.message,
                stack: config.DEBUG_MODE ? error.stack : undefined,
                responseTime: `${responseTime}ms`,
                questionPreview: req.body.question?.substring(0, 50) + '...'
            });

            // MAXIMIZED: Enhanced error handling
            const errorResponse = this.handleMaximizedError(error, requestId);

            // Update error analytics
            this.analytics.errorCounts.set(errorResponse.type,
                (this.analytics.errorCounts.get(errorResponse.type) || 0) + 1);

            return res.status(errorResponse.statusCode).json({
                success: false,
                message: errorResponse.message,
                errorType: errorResponse.type,
                requestId: requestId,
                responseTime: responseTime,
                timestamp: new Date().toISOString(),
                suggestions: errorResponse.suggestions,
                retryable: errorResponse.retryable,
                version: 'maximized-v2.0'
            });
        }
    }

    // MAXIMIZED: Enhanced request validation
    validateMaximizedRequest(body) {
        // Check question
        if (!body.question) {
            return {
                isValid: false,
                message: 'Pertanyaan tidak boleh kosong',
                type: 'missing_question',
                suggestions: ['Masukkan pertanyaan yang ingin Anda tanyakan']
            };
        }

        if (typeof body.question !== 'string') {
            return {
                isValid: false,
                message: 'Pertanyaan harus berupa text',
                type: 'invalid_question_type',
                suggestions: ['Pastikan pertanyaan berupa teks yang valid']
            };
        }

        const question = body.question.trim();

        if (question.length === 0) {
            return {
                isValid: false,
                message: 'Pertanyaan tidak boleh hanya spasi kosong',
                type: 'empty_question',
                suggestions: ['Ketik pertanyaan yang bermakna']
            };
        }

        if (question.length > config.APP_CONFIG.maxQuestionLength) {
            return {
                isValid: false,
                message: `Pertanyaan terlalu panjang (maksimal ${config.APP_CONFIG.maxQuestionLength} karakter)`,
                type: 'question_too_long',
                suggestions: [
                    'Bagi pertanyaan menjadi beberapa bagian',
                    'Fokus pada poin utama yang ingin ditanyakan'
                ]
            };
        }

        // MAXIMIZED: Advanced spam detection
        if (/(.)\1{15,}/.test(question)) {
            return {
                isValid: false,
                message: 'Format pertanyaan tidak valid - terlalu banyak karakter berulang',
                type: 'spam_pattern',
                suggestions: ['Gunakan kalimat yang natural dan bervariasi']
            };
        }

        // MAXIMIZED: Check for excessive capitalization
        const uppercaseRatio = (question.match(/[A-Z]/g) || []).length / question.length;
        if (uppercaseRatio > 0.6 && question.length > 20) {
            return {
                isValid: false,
                message: 'Terlalu banyak huruf kapital. Gunakan kapitalisasi yang normal.',
                type: 'excessive_caps',
                suggestions: ['Gunakan huruf kapital hanya di awal kalimat dan nama proper']
            };
        }

        // MAXIMIZED: Content quality checks
        const wordCount = question.split(/\s+/).length;
        if (wordCount === 1 && question.length > 20) {
            return {
                isValid: false,
                message: 'Pertanyaan terlalu singkat atau tidak jelas',
                type: 'low_quality',
                suggestions: [
                    'Jelaskan lebih detail apa yang ingin Anda ketahui',
                    'Gunakan kalimat lengkap dengan subjek dan predikat'
                ]
            };
        }

        // Validate context if provided
        if (body.context) {
            const contextValidation = this.validateContext(body.context);
            if (!contextValidation.isValid) {
                return contextValidation;
            }
        }

        return { isValid: true };
    }

    // MAXIMIZED: FIXED Context validation - More lenient limits
    validateContext(context) {
        if (!Array.isArray(context)) {
            return {
                isValid: false,
                message: 'Format context tidak valid',
                type: 'invalid_context_format',
                suggestions: ['Context harus berupa array dari pesan sebelumnya']
            };
        }

        // FIXED: More lenient limit
        if (context.length > 50) {
            return {
                isValid: false,
                message: `Terlalu banyak history (maksimal 50)`,
                type: 'context_too_long',
                suggestions: ['Kurangi jumlah pesan dalam history']
            };
        }

        // Validate context items
        for (let i = 0; i < context.length; i++) {
            const item = context[i];

            if (!item || typeof item !== 'object') {
                return {
                    isValid: false,
                    message: `Context item ${i + 1} tidak valid`,
                    type: 'invalid_context_item',
                    suggestions: ['Pastikan setiap context item berupa object yang valid']
                };
            }

            if (!item.text || typeof item.isUser !== 'boolean') {
                return {
                    isValid: false,
                    message: `Context item ${i + 1} missing required fields`,
                    type: 'invalid_context_item',
                    suggestions: ['Context item harus memiliki field "text" dan "isUser"']
                };
            }

            // FIXED: Much more lenient limit for context items (was 600, now 10000)
            if (item.text.length > 10000) {
                return {
                    isValid: false,
                    message: `Context item ${i + 1} terlalu panjang`,
                    type: 'context_item_too_long',
                    suggestions: ['Persingkat pesan dalam history']
                };
            }
        }

        return { isValid: true };
    }

    // MAXIMIZED: FIXED Advanced context processing - Better truncation
    processMaximizedContext(context) {
        if (!context || !Array.isArray(context) || context.length === 0) {
            return [];
        }

        // MAXIMIZED: Smart context selection (take last 6 messages)
        const recentContext = context.slice(-6);

        return recentContext.map(msg => {
            // FIXED: Smarter truncation for long messages
            let truncatedText = msg.text;
            if (truncatedText.length > 500) {
                // Keep first 250 chars and last 200 chars with separator
                truncatedText = truncatedText.substring(0, 250) +
                    '\n...[text truncated]...\n' +
                    truncatedText.substring(truncatedText.length - 200);
            }

            return {
                text: truncatedText,
                isUser: !!msg.isUser,
                timestamp: msg.timestamp || new Date().toISOString(),
                // MAXIMIZED: Add message quality score
                quality: this.assessMessageQuality(truncatedText)
            };
        }).filter(msg => msg.text.trim().length > 0 && msg.quality > 0.3);
    }

    // MAXIMIZED: Assess message quality
    assessMessageQuality(text) {
        let score = 1.0;

        // Penalize very short messages
        if (text.length < 10) score *= 0.5;

        // Penalize repetitive characters
        if (/(.)\1{5,}/.test(text)) score *= 0.3;

        // Penalize all caps
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (capsRatio > 0.5) score *= 0.6;

        // Boost questions and meaningful content
        if (/\?/.test(text)) score *= 1.2;
        if (/\b(bagaimana|mengapa|kapan|dimana|apa|siapa)\b/i.test(text)) score *= 1.3;

        return Math.max(0, Math.min(1, score));
    }

    // MAXIMIZED: Response caching
    getCachedResponse(question, context) {
        if (!config.isFeatureEnabled('enableResponseCaching')) return null;

        const cacheKey = this.generateCacheKey(question, context);
        const cached = this.responseCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < config.getPerformanceConfig().cacheTimeout) {
            cached.hits = (cached.hits || 0) + 1;
            return cached.response;
        }

        // Remove expired cache entry
        if (cached) {
            this.responseCache.delete(cacheKey);
        }

        return null;
    }

    // MAXIMIZED: Cache response
    cacheResponse(question, context, response) {
        if (!config.isFeatureEnabled('enableResponseCaching')) return;

        const cacheKey = this.generateCacheKey(question, context);

        // Don't cache fallback responses or errors
        if (response.fallback || !response.success) return;

        this.responseCache.set(cacheKey, {
            response: {
                success: response.success,
                message: response.message,
                metadata: {
                    ...response.metadata,
                    cached: true
                }
            },
            timestamp: Date.now(),
            hits: 0
        });

        // Limit cache size
        if (this.responseCache.size > 100) {
            const oldestKey = this.responseCache.keys().next().value;
            this.responseCache.delete(oldestKey);
        }
    }

    // MAXIMIZED: Generate cache key
    generateCacheKey(question, context) {
        const contextHash = context ?
            context.slice(-2).map(c => c.text.substring(0, 50)).join('|') : '';
        return `${question.toLowerCase().substring(0, 100)}_${contextHash}`;
    }

    // MAXIMIZED: Enhanced error handling
    handleMaximizedError(error, requestId) {
        // Rate limiting errors
        if (error.message.includes('Too Many Requests') || error.message.includes('429')) {
            return {
                statusCode: 429,
                message: '🚦 **Rate Limit Reached**\n\nAnda telah mencapai batas maksimal permintaan. Ini membantu menjaga kualitas layanan untuk semua pengguna.\n\n**Saran:**\n• Tunggu 1-2 menit sebelum mencoba lagi\n• Pertanyaan yang lebih spesifik akan diproses lebih cepat\n• Gunakan fitur chat history untuk melihat jawaban sebelumnya',
                type: 'rate_limit',
                retryable: true,
                suggestions: [
                    'Tunggu beberapa menit sebelum bertanya lagi',
                    'Buat pertanyaan yang lebih spesifik',
                    'Review chat history untuk jawaban sebelumnya'
                ]
            };
        }

        // Authentication errors
        if (error.message.includes('API key') ||
            error.message.includes('401') ||
            error.message.includes('403')) {
            return {
                statusCode: 502,
                message: '🔧 **Konfigurasi Sistem**\n\nSedang ada masalah dengan konfigurasi sistem AI. Tim teknis kami sedang menanganinya.\n\n**Status:** Dalam perbaikan\n**Estimasi:** 5-10 menit\n\nSilakan coba lagi sebentar.',
                type: 'auth_error',
                retryable: true,
                suggestions: [
                    'Coba lagi dalam beberapa menit',
                    'Periksa status sistem di halaman utama',
                    'Hubungi support jika masalah berlanjut'
                ]
            };
        }

        // Network/timeout errors
        if (error.message.includes('timeout') ||
            error.message.includes('ECONNRESET') ||
            error.message.includes('ETIMEDOUT') ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT') {
            return {
                statusCode: 503,
                message: '🌐 **Koneksi Bermasalah**\n\nSedang ada gangguan koneksi ke server AI.\n\n**Solusi Cepat:**\n• Periksa koneksi internet Anda\n• Refresh halaman dan coba lagi\n• Gunakan pertanyaan yang lebih singkat\n\n**Status:** Biasanya teratasi dalam 1-2 menit',
                type: 'network_error',
                retryable: true,
                suggestions: [
                    'Periksa koneksi internet',
                    'Refresh halaman browser',
                    'Coba dengan pertanyaan yang lebih pendek',
                    'Tunggu 1-2 menit lalu coba lagi'
                ]
            };
        }

        // Default comprehensive error
        return {
            statusCode: 500,
            message: `🤖 **Gangguan Sistem Sementara**\n\nSistem AI mengalami gangguan teknis yang tidak terduga.\n\n**Langkah Troubleshooting:**\n1. **Refresh halaman** dan coba lagi\n2. **Restart browser** jika masalah berlanjut\n3. **Coba pertanyaan yang lebih sederhana**\n4. **Tunggu 5-10 menit** lalu coba lagi\n\n**Jika masalah berlanjut:**\n• Laporkan ke tim support dengan ID: ${requestId}\n• Sertakan detail pertanyaan yang ingin diajukan\n\n**Sistem biasanya pulih dalam hitungan menit.**`,
            type: 'system_error',
            retryable: true,
            suggestions: [
                'Refresh halaman browser',
                'Coba dengan pertanyaan yang lebih sederhana',
                'Tunggu beberapa menit lalu coba lagi',
                'Laporkan ke support dengan request ID jika berlanjut'
            ]
        };
    }

    // MAXIMIZED: Update analytics
    updateAnalytics(question) {
        // Extract keywords
        const words = question.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);

        words.forEach(word => {
            this.analytics.topKeywords.set(word,
                (this.analytics.topKeywords.get(word) || 0) + 1);
        });

        // Keep only top 50 keywords
        if (this.analytics.topKeywords.size > 50) {
            const sorted = Array.from(this.analytics.topKeywords.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 50);

            this.analytics.topKeywords.clear();
            sorted.forEach(([word, count]) =>
                this.analytics.topKeywords.set(word, count));
        }
    }

    // MAXIMIZED: Update average response time
    updateAverageResponseTime(responseTime) {
        const current = this.analytics.averageResponseTime;
        const count = this.analytics.questionsProcessed;

        this.analytics.averageResponseTime =
            ((current * (count - 1)) + responseTime) / count;
    }

    // MAXIMIZED: Get public analytics
    getPublicAnalytics() {
        return {
            questionsProcessed: this.analytics.questionsProcessed,
            averageResponseTime: Math.round(this.analytics.averageResponseTime),
            topKeywords: Array.from(this.analytics.topKeywords.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([word, count]) => ({ word, count })),
            cacheStats: {
                size: this.responseCache.size,
                enabled: config.isFeatureEnabled('enableResponseCaching')
            }
        };
    }

    // MAXIMIZED: Health check endpoint
    healthCheck(req, res) {
        try {
            const geminiStats = geminiModel.getMaximizedStats ?
                geminiModel.getMaximizedStats() : geminiModel.getStats();

            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: config.getVersion(),
                mode: config.isMaximizedMode() ? 'maximized' : 'standard',

                // System health
                system: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage()
                },

                // Configuration
                config: {
                    maxQuestionLength: config.APP_CONFIG.maxQuestionLength,
                    maxContextItems: config.APP_CONFIG.maxContextItems,
                    rateLimitMax: config.APP_CONFIG.rateLimiting.maxRequests,
                    cacheEnabled: config.isFeatureEnabled('enableResponseCaching'),
                    debugMode: config.DEBUG_MODE
                },

                // Model health
                model: geminiStats,

                // Analytics
                analytics: this.analytics,

                // Cache statistics
                cache: {
                    size: this.responseCache.size,
                    hitRate: this.calculateCacheHitRate()
                }
            };

            res.json(health);

        } catch (error) {
            console.error('Health check error:', error);
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }

    // MAXIMIZED: Calculate cache hit rate
    calculateCacheHitRate() {
        if (this.responseCache.size === 0) return '0%';

        let totalHits = 0;
        let totalAccess = 0;

        for (const [key, data] of this.responseCache.entries()) {
            totalHits += data.hits || 0;
            totalAccess += (data.hits || 0) + 1; // +1 for initial store
        }

        return totalAccess > 0 ?
            `${((totalHits / totalAccess) * 100).toFixed(2)}%` : '0%';
    }

    // MAXIMIZED: Cleanup cache
    cleanupCache() {
        const now = Date.now();
        const timeout = config.getPerformanceConfig().cacheTimeout;
        let cleaned = 0;

        for (const [key, data] of this.responseCache.entries()) {
            if (now - data.timestamp > timeout) {
                this.responseCache.delete(key);
                cleaned++;
            }
        }

        if (config.DEBUG_MODE && cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
        }
    }

    // MAXIMIZED: Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // MAXIMIZED: Advanced metrics endpoint
    getMetrics(req, res) {
        try {
            const metrics = {
                timestamp: new Date().toISOString(),
                analytics: this.analytics,
                performance: {
                    questionsProcessed: this.analytics.questionsProcessed,
                    averageResponseTime: Math.round(this.analytics.averageResponseTime),
                    cacheHitRate: this.calculateCacheHitRate(),
                    cacheSize: this.responseCache.size
                },
                errors: Object.fromEntries(this.analytics.errorCounts),
                topKeywords: Object.fromEntries(
                    Array.from(this.analytics.topKeywords.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 20)
                ),
                system: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: config.getVersion(),
                    maximizedMode: config.isMaximizedMode()
                }
            };

            res.json(metrics);

        } catch (error) {
            console.error('Metrics error:', error);
            res.status(500).json({
                error: 'Unable to retrieve metrics',
                timestamp: new Date().toISOString()
            });
        }
    }
}

// MAXIMIZED: Create singleton instance
const maximizedChatController = new MaximizedChatController();

// MAXIMIZED: Export controller methods
module.exports = {
    showChat: (req, res) => maximizedChatController.showChat(req, res),
    processQuestion: (req, res) => maximizedChatController.processQuestion(req, res),
    healthCheck: (req, res) => maximizedChatController.healthCheck(req, res),
    getMetrics: (req, res) => maximizedChatController.getMetrics(req, res),

    // Additional utilities
    getAnalytics: () => maximizedChatController.getPublicAnalytics(),
    clearCache: () => maximizedChatController.responseCache.clear(),
    getInstance: () => maximizedChatController
};