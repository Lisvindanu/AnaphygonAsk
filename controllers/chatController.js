/**
 * UPGRADED Controller untuk halaman chat dan fungsi AI
 * Enhanced version with better optimizations
 */
const geminiModel = require('../models/geminiModel');
const config = require('../config/config');

const chatController = {
    showChat: (req, res) => {
        res.render('chat', {
            title: 'Tanya AI',
            config: config.APP_CONFIG
        });
    },

    /**
     * UPGRADED: Process question dengan optimasi yang lebih baik
     */
    processQuestion: async (req, res) => {
        try {
            if (config.DEBUG_MODE) {
                console.log('Chat request received:', {
                    questionLength: req.body.question?.length || 0,
                    hasContext: !!req.body.context,
                    timestamp: new Date().toISOString(),
                    ip: req.ip,
                    // UPGRADED: Tambahan info
                    contextItems: req.body.context?.length || 0
                });
            }

            // UPGRADED: Validasi yang lebih ketat dengan additional checks
            const validation = validateRequest(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message,
                    // UPGRADED: Tambahan info untuk debugging
                    validationType: validation.type || 'general'
                });
            }

            const { question, context } = req.body;

            // UPGRADED: Context processing yang lebih efisien
            const processedContext = processOptimizedContext(context);

            // UPGRADED: Pre-validation menggunakan model validation
            const modelValidation = geminiModel.validateQuestion(question);
            if (!modelValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: modelValidation.message,
                    validationType: 'model_validation'
                });
            }

            // Kirim ke AI model
            const startTime = Date.now(); // UPGRADED: Track response time
            const response = await geminiModel.askQuestion(question, processedContext);
            const responseTime = Date.now() - startTime; // UPGRADED: Calculate response time

            if (response.success) {
                if (config.DEBUG_MODE) {
                    console.log('AI response success:', {
                        responseLength: response.message.length,
                        isFallback: !!response.fallback,
                        responseTime: `${responseTime}ms`, // UPGRADED: Log response time
                        fallbackType: response.fallbackType, // UPGRADED: Log fallback type
                        timestamp: new Date().toISOString()
                    });
                }

                return res.json({
                    success: true,
                    message: response.message,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        isFallback: !!response.fallback,
                        fallbackType: response.fallbackType, // UPGRADED: Include fallback type
                        responseTime: responseTime, // UPGRADED: Include response time
                        model: response.metadata?.model || 'gemini-2.0-flash',
                        // UPGRADED: Additional metadata
                        contextUsed: processedContext.length,
                        version: 'upgraded'
                    }
                });
            } else {
                throw new Error(response.message || 'AI response failed');
            }

        } catch (error) {
            console.error('Error in processQuestion:', {
                message: error.message,
                timestamp: new Date().toISOString(),
                questionPreview: req.body.question?.substring(0, 50) + '...',
                // UPGRADED: Additional error info
                stack: config.DEBUG_MODE ? error.stack : undefined,
                contextLength: req.body.context?.length || 0
            });

            const errorResponse = handleChatError(error);

            return res.status(errorResponse.statusCode).json({
                success: false,
                message: errorResponse.message,
                timestamp: new Date().toISOString(),
                error: config.DEBUG_MODE ? error.message : undefined,
                // UPGRADED: Additional error metadata
                errorType: errorResponse.type || 'unknown',
                version: 'upgraded'
            });
        }
    },

    // UPGRADED: Tambahan endpoint untuk health check
    healthCheck: (req, res) => {
        const stats = geminiModel.getStats ? geminiModel.getStats() : {};
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            model: stats,
            config: {
                maxQuestionLength: config.APP_CONFIG.maxQuestionLength,
                maxContextItems: config.APP_CONFIG.maxContextItems,
                debugMode: config.DEBUG_MODE
            }
        });
    }
};

/**
 * UPGRADED: Validasi request yang lebih comprehensive
 */
function validateRequest(body) {
    // Check question
    if (!body.question) {
        return {
            isValid: false,
            message: 'Pertanyaan tidak boleh kosong',
            type: 'missing_question'
        };
    }

    if (typeof body.question !== 'string') {
        return {
            isValid: false,
            message: 'Pertanyaan harus berupa text',
            type: 'invalid_question_type'
        };
    }

    const question = body.question.trim();

    if (question.length === 0) {
        return {
            isValid: false,
            message: 'Pertanyaan tidak boleh kosong',
            type: 'empty_question'
        };
    }

    if (question.length > 2000) {
        return {
            isValid: false,
            message: 'Pertanyaan terlalu panjang (maksimal 2000 karakter)',
            type: 'question_too_long'
        };
    }

    // UPGRADED: Enhanced spam detection
    if (/(.)\1{20,}/.test(question)) {
        return {
            isValid: false,
            message: 'Format pertanyaan tidak valid',
            type: 'spam_pattern'
        };
    }

    // UPGRADED: Check for excessive capitalization
    const uppercaseRatio = (question.match(/[A-Z]/g) || []).length / question.length;
    if (uppercaseRatio > 0.7 && question.length > 20) {
        return {
            isValid: false,
            message: 'Terlalu banyak huruf kapital. Gunakan kapitalisasi yang normal.',
            type: 'excessive_caps'
        };
    }

    // Validate context jika ada
    if (body.context) {
        if (!Array.isArray(body.context)) {
            return {
                isValid: false,
                message: 'Format context tidak valid',
                type: 'invalid_context_format'
            };
        }

        if (body.context.length > 20) {
            return {
                isValid: false,
                message: 'Terlalu banyak history (maksimal 20)',
                type: 'context_too_long'
            };
        }

        // Check context items
        for (let i = 0; i < body.context.length; i++) {
            const item = body.context[i];
            if (!item.text || typeof item.isUser !== 'boolean') {
                return {
                    isValid: false,
                    message: 'Format context item tidak valid',
                    type: 'invalid_context_item'
                };
            }

            if (item.text.length > 5000) {
                return {
                    isValid: false,
                    message: 'Context item terlalu panjang',
                    type: 'context_item_too_long'
                };
            }
        }
    }

    return { isValid: true };
}

/**
 * UPGRADED: Process context lebih efisien (improved from previous version)
 */
function processOptimizedContext(context) {
    if (!context || !Array.isArray(context) || context.length === 0) {
        return [];
    }

    // UPGRADED: Ambil hanya 4 pesan terakhir untuk efisiensi maksimal (dari 6)
    const recentContext = context.slice(-4);

    return recentContext.map(msg => ({
        text: msg.text.substring(0, 150), // UPGRADED: Reduce from 200 to 150
        isUser: !!msg.isUser,
        timestamp: msg.timestamp || new Date().toISOString()
    })).filter(msg => msg.text.trim().length > 0); // Remove empty messages
}

/**
 * LEGACY: Process context (tetap dipertahankan untuk backward compatibility)
 */
function processContext(context) {
    return processOptimizedContext(context);
}

/**
 * UPGRADED: Error handling yang lebih spesifik dengan error types
 */
function handleChatError(error) {
    // Rate limiting
    if (error.message.includes('Too Many Requests') || error.message.includes('429')) {
        return {
            statusCode: 429,
            message: 'Terlalu banyak permintaan. Tunggu 1 menit lalu coba lagi.',
            type: 'rate_limit'
        };
    }

    // API authentication
    if (error.message.includes('API key') ||
        error.message.includes('401') ||
        error.message.includes('403')) {
        return {
            statusCode: 500,
            message: 'Terjadi masalah konfigurasi sistem. Silakan coba lagi nanti.',
            type: 'auth_error'
        };
    }

    // Network issues
    if (error.message.includes('timeout') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT') {
        return {
            statusCode: 503,
            message: 'Koneksi bermasalah. Coba lagi dalam beberapa saat.',
            type: 'network_error'
        };
    }

    // Quota/limit issues
    if (error.message.includes('quota') ||
        error.message.includes('limit') ||
        error.message.includes('exceeded')) {
        return {
            statusCode: 503,
            message: 'Layanan sedang sibuk. Coba lagi dalam 5-10 menit.',
            type: 'quota_exceeded'
        };
    }

    // Content policy
    if (error.message.includes('content policy') ||
        error.message.includes('safety') ||
        error.message.includes('blocked')) {
        return {
            statusCode: 400,
            message: 'Pertanyaan tidak dapat diproses. Coba dengan kata-kata yang berbeda.',
            type: 'content_blocked'
        };
    }

    // Validation errors
    if (error.message.includes('validation') ||
        error.message.includes('invalid')) {
        return {
            statusCode: 400,
            message: 'Format pertanyaan tidak valid. Periksa kembali dan coba lagi.',
            type: 'validation_error'
        };
    }

    // UPGRADED: API specific errors
    if (error.response?.status === 500) {
        return {
            statusCode: 502,
            message: 'Server AI sedang bermasalah. Coba lagi dalam beberapa menit.',
            type: 'api_server_error'
        };
    }

    if (error.response?.status === 503) {
        return {
            statusCode: 503,
            message: 'Layanan AI sedang maintenance. Coba lagi nanti.',
            type: 'service_unavailable'
        };
    }

    // Default error
    return {
        statusCode: 500,
        message: 'Terjadi kesalahan sistem. Silakan coba lagi atau hubungi support jika masalah berlanjut.',
        type: 'system_error'
    };
}

module.exports = chatController;