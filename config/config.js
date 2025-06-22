/**
 * MAXIMIZED Configuration untuk AnaphygonAsk
 * Fixed version with all required methods
 */

// MAXIMIZED: Enhanced validation with comprehensive checks
function validateMaximizedConfig() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY tidak ditemukan di environment variables');
        console.error('💡 Setup guide:');
        console.error('   1. Buat file .env di root project');
        console.error('   2. Tambahkan: GEMINI_API_KEY=your_actual_api_key');
        console.error('   3. Dapatkan API key dari: https://makersuite.google.com/app/apikey');
        process.exit(1);
    }

    if (!apiKey.startsWith('AIza')) {
        console.warn('⚠️  API key format mungkin tidak valid - harus dimulai dengan "AIza"');
        console.warn('💡 Periksa kembali API key dari Google AI Studio');
    }

    if (apiKey.length < 35) {
        console.warn('⚠️  API key terlihat terlalu pendek (biasanya 39+ karakter)');
    }

    // MAXIMIZED: Check for common placeholder values
    const placeholders = [
        'your_api_key_here',
        'AIzaSyBSHWompvEBuU5v4AE1LS3THWUX2o57X9o',
        'paste_your_api_key_here',
        'your_gemini_api_key'
    ];

    if (placeholders.includes(apiKey)) {
        console.error('❌ Menggunakan API key placeholder! Ganti dengan API key yang valid!');
        console.error('📝 Tutorial lengkap: https://ai.google.dev/tutorials/setup');
        process.exit(1);
    }

    console.log('✅ API key validation passed - MAXIMIZED configuration ready');
    return apiKey;
}

// MAXIMIZED: Advanced environment detection
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEBUG_MODE = NODE_ENV !== 'production' || process.env.DEBUG === 'true';
const MAXIMIZED_MODE = process.env.MAXIMIZED_MODE !== 'false'; // Default enabled

// MAXIMIZED: Validated API key
const GEMINI_API_KEY = validateMaximizedConfig();

// MAXIMIZED: Advanced generation configuration
const MAXIMIZED_GEMINI_CONFIG = {
    // Core generation settings
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,    // MAXIMIZED: Higher creativity
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 4000,  // MAXIMIZED: Extended output
    topP: parseFloat(process.env.GEMINI_TOP_P) || 0.9,                // MAXIMIZED: Higher diversity
    topK: parseInt(process.env.GEMINI_TOP_K) || 40,                   // MAXIMIZED: More candidates

    // Advanced settings
    candidateCount: 1,
    stopSequences: ["<|END|>", "---STOP---", "<|FINISH|>"],

    // Response quality settings
    responseMimeType: "text/plain",

    // MAXIMIZED: Custom generation modes
    modes: {
        creative: {
            temperature: 0.9,
            topP: 0.95,
            topK: 50
        },
        balanced: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40
        },
        precise: {
            temperature: 0.3,
            topP: 0.8,
            topK: 20
        }
    }
};

// MAXIMIZED: Comprehensive application configuration
const MAXIMIZED_APP_CONFIG = {
    // Basic app info
    appName: 'AnaphygonAsk',
    version: '2.5.0', // MAXIMIZED version
    description: 'AI-powered Q&A platform with maximized Gemini API integration',
    footerText: `© ${new Date().getFullYear()} AnaphygonAsk - Powered by Maximized Gemini AI`,

    // MAXIMIZED: Extended limits
    maxQuestionLength: 5000,        // Increased from 2000
    maxContextItems: 8,             // Increased from 6
    maxContextItemLength: 300,      // Increased from 200
    maxSessionsPerUser: 50,         // New limit
    maxMessagesPerSession: 200,     // New limit

    // MAXIMIZED: Rate limiting configuration
    rateLimiting: {
        windowMs: 60 * 1000,        // 1 minute window
        maxRequests: 15,            // Increased from 10
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: 'Too many requests, please try again later.',
            resetTime: 'Rate limit resets in 1 minute'
        }
    },

    // MAXIMIZED: Advanced feature flags
    features: {
        // Core features
        enableContextHistory: true,
        enableMarkdownParsing: true,
        enableFallbackResponses: true,
        enableDebugLogging: DEBUG_MODE,

        // MAXIMIZED: Advanced features
        enableMaximizedMode: MAXIMIZED_MODE,
        enableSmartRetries: true,
        enablePerformanceMonitoring: true,
        enableAdvancedErrorHandling: true,
        enableResponseCaching: true,
        enableSessionManagement: true,
        enableAdvancedPrompts: true,
        enableContextOptimization: true,
        enableResponseEnhancement: true,
        enableAnalytics: DEBUG_MODE,

        // Experimental features
        enableExperimentalFeatures: process.env.ENABLE_EXPERIMENTAL === 'true',
        enableA11yFeatures: true,
        enablePWAFeatures: true
    },

    // MAXIMIZED: Performance configuration
    performance: {
        maxResponseTime: 30000,         // 30 seconds
        warningResponseTime: 15000,     // 15 seconds
        retryAttempts: 3,               // API retry attempts
        retryDelayBase: 1000,           // Base delay for exponential backoff
        enableCaching: true,
        cacheTimeout: 300000,           // 5 minutes
        enableCompression: true,
        enableMetrics: true
    },

    // MAXIMIZED: Error handling configuration
    errorHandling: {
        enableDetailedErrors: DEBUG_MODE,
        enableErrorTypes: true,
        enableFallbackChain: true,
        enableGracefulDegradation: true,
        enableErrorAnalytics: true,
        maxRetries: 3,
        retryDelay: 1000,
        enableCircuitBreaker: true
    },

    // MAXIMIZED: Security configuration
    security: {
        enableRateLimiting: true,
        enableInputSanitization: true,
        enableXSSProtection: true,
        enableCSRFProtection: true,
        enableCORS: true,
        maxFileSize: '10mb',
        allowedOrigins: process.env.ALLOWED_ORIGINS ?
            process.env.ALLOWED_ORIGINS.split(',') : ['*']
    },

    // MAXIMIZED: Monitoring configuration
    monitoring: {
        enableHealthChecks: true,
        enablePerformanceTracking: true,
        enableUsageAnalytics: DEBUG_MODE,
        enableErrorTracking: true,
        metricsInterval: 60000, // 1 minute
        healthCheckInterval: 30000 // 30 seconds
    }
};

// MAXIMIZED: Advanced logging with structured output
if (DEBUG_MODE) {
    console.log('\n🚀 MAXIMIZED Configuration Loaded:');
    console.log('╭─────────────────────────────────────────────────────────╮');
    console.log('│                  ANAPHYGONASK MAXIMIZED                │');
    console.log('╰─────────────────────────────────────────────────────────╯');
    console.log('');
    console.log('📊 Application Info:');
    console.log(`├── App Name: ${MAXIMIZED_APP_CONFIG.appName}`);
    console.log(`├── Version: ${MAXIMIZED_APP_CONFIG.version}`);
    console.log(`├── Environment: ${NODE_ENV}`);
    console.log(`├── Debug Mode: ${DEBUG_MODE ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`└── Maximized Mode: ${MAXIMIZED_MODE ? '🚀 Active' : '⚠️  Inactive'}`);
    console.log('');
    console.log('🔧 API Configuration:');
    console.log(`├── API Key: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`├── Temperature: ${MAXIMIZED_GEMINI_CONFIG.temperature}`);
    console.log(`├── Max Tokens: ${MAXIMIZED_GEMINI_CONFIG.maxOutputTokens}`);
    console.log(`├── Top P: ${MAXIMIZED_GEMINI_CONFIG.topP}`);
    console.log(`└── Top K: ${MAXIMIZED_GEMINI_CONFIG.topK}`);
    console.log('');
    console.log('🎯 Enhanced Features:');
    const enabledFeatures = Object.entries(MAXIMIZED_APP_CONFIG.features)
        .filter(([key, value]) => value)
        .map(([key]) => key);
    enabledFeatures.forEach((feature, index) => {
        const isLast = index === enabledFeatures.length - 1;
        console.log(`${isLast ? '└──' : '├──'} ${feature}: ✅`);
    });
    console.log('');
    console.log('⚡ Performance Settings:');
    console.log(`├── Max Response Time: ${MAXIMIZED_APP_CONFIG.performance.maxResponseTime}ms`);
    console.log(`├── Retry Attempts: ${MAXIMIZED_APP_CONFIG.performance.retryAttempts}`);
    console.log(`├── Cache Timeout: ${MAXIMIZED_APP_CONFIG.performance.cacheTimeout}ms`);
    console.log(`└── Compression: ${MAXIMIZED_APP_CONFIG.performance.enableCompression ? '✅' : '❌'}`);
    console.log('');
    console.log('🔒 Security & Rate Limiting:');
    console.log(`├── Rate Limit: ${MAXIMIZED_APP_CONFIG.rateLimiting.maxRequests} req/min`);
    console.log(`├── Max Question Length: ${MAXIMIZED_APP_CONFIG.maxQuestionLength} chars`);
    console.log(`├── Max Context Items: ${MAXIMIZED_APP_CONFIG.maxContextItems}`);
    console.log(`└── XSS Protection: ${MAXIMIZED_APP_CONFIG.security.enableXSSProtection ? '✅' : '❌'}`);
    console.log('');
    console.log('🎮 Ready to serve maximized AI responses!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
}

// MAXIMIZED: Export with enhanced functionality
module.exports = {
    // Core configuration
    DEBUG_MODE,
    NODE_ENV,
    MAXIMIZED_MODE,
    GEMINI_API_KEY,
    GEMINI_GENERATION_CONFIG: MAXIMIZED_GEMINI_CONFIG,
    APP_CONFIG: MAXIMIZED_APP_CONFIG,

    // MAXIMIZED: Enhanced helper functions
    isProduction: () => NODE_ENV === 'production',
    isDevelopment: () => NODE_ENV !== 'production',
    isMaximizedMode: () => MAXIMIZED_MODE,

    getApiKey: () => GEMINI_API_KEY,

    // MAXIMIZED: Advanced validation helper
    validateApiKey: () => {
        return GEMINI_API_KEY &&
            GEMINI_API_KEY.length > 30 &&
            GEMINI_API_KEY.startsWith('AIza') &&
            !['your_api_key_here', 'AIzaSyBSHWompvEBuU5v4AE1LS3THWUX2o57X9o'].includes(GEMINI_API_KEY);
    },

    // MAXIMIZED: Configuration getters
    getVersion: () => MAXIMIZED_APP_CONFIG.version,
    getAppName: () => MAXIMIZED_APP_CONFIG.appName,

    isFeatureEnabled: (featureName) => {
        return MAXIMIZED_APP_CONFIG.features[featureName] || false;
    },

    getPerformanceConfig: () => MAXIMIZED_APP_CONFIG.performance,
    getErrorConfig: () => MAXIMIZED_APP_CONFIG.errorHandling,
    getSecurityConfig: () => MAXIMIZED_APP_CONFIG.security,
    getRateLimitConfig: () => MAXIMIZED_APP_CONFIG.rateLimiting,

    // MAXIMIZED: Generation mode selector
    getGenerationConfig: (mode = 'balanced') => {
        const baseConfig = MAXIMIZED_GEMINI_CONFIG;
        const modeConfig = baseConfig.modes[mode] || baseConfig.modes.balanced;

        return {
            ...baseConfig,
            ...modeConfig
        };
    },

    // MAXIMIZED: Dynamic feature toggling
    updateFeature: (featureName, enabled) => {
        if (MAXIMIZED_APP_CONFIG.features.hasOwnProperty(featureName)) {
            MAXIMIZED_APP_CONFIG.features[featureName] = enabled;
            if (DEBUG_MODE) {
                console.log(`🔧 Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
            }
            return true;
        }
        return false;
    },

    // MAXIMIZED: Comprehensive configuration validation
    validateConfiguration: () => {
        const issues = [];
        const warnings = [];

        // API Key validation
        if (!GEMINI_API_KEY) {
            issues.push('API Key missing');
        } else if (!GEMINI_API_KEY.startsWith('AIza')) {
            issues.push('Invalid API Key format');
        } else if (GEMINI_API_KEY.length < 35) {
            warnings.push('API Key seems too short');
        }

        // Configuration validation
        if (MAXIMIZED_APP_CONFIG.maxQuestionLength < 100) {
            issues.push('Question length limit too low');
        }

        if (MAXIMIZED_APP_CONFIG.rateLimiting.maxRequests < 1) {
            issues.push('Rate limit too restrictive');
        }

        if (MAXIMIZED_GEMINI_CONFIG.temperature < 0 || MAXIMIZED_GEMINI_CONFIG.temperature > 1) {
            warnings.push('Temperature outside recommended range (0-1)');
        }

        if (MAXIMIZED_GEMINI_CONFIG.maxOutputTokens > 8192) {
            warnings.push('Max tokens very high, may impact performance');
        }

        return {
            isValid: issues.length === 0,
            issues: issues,
            warnings: warnings,
            score: Math.max(0, 100 - (issues.length * 25) - (warnings.length * 5))
        };
    },

    // MAXIMIZED: Health check configuration
    getHealthCheck: () => ({
        timestamp: new Date().toISOString(),
        version: MAXIMIZED_APP_CONFIG.version,
        mode: MAXIMIZED_MODE ? 'maximized' : 'standard',
        environment: NODE_ENV,
        api: {
            configured: !!GEMINI_API_KEY,
            model: 'gemini-2.0-flash',
            version: '2.0'
        },
        features: {
            enabled: Object.keys(MAXIMIZED_APP_CONFIG.features).filter(
                key => MAXIMIZED_APP_CONFIG.features[key]
            ).length,
            total: Object.keys(MAXIMIZED_APP_CONFIG.features).length
        },
        performance: MAXIMIZED_APP_CONFIG.performance,
        security: {
            rateLimiting: MAXIMIZED_APP_CONFIG.rateLimiting.maxRequests,
            xssProtection: MAXIMIZED_APP_CONFIG.security.enableXSSProtection,
            inputSanitization: MAXIMIZED_APP_CONFIG.security.enableInputSanitization
        }
    }),

    // MAXIMIZED: Full configuration export for debugging
    getFullConfig: () => ({
        app: {
            name: MAXIMIZED_APP_CONFIG.appName,
            version: MAXIMIZED_APP_CONFIG.version,
            description: MAXIMIZED_APP_CONFIG.description,
            environment: NODE_ENV,
            debug: DEBUG_MODE,
            maximized: MAXIMIZED_MODE
        },
        api: {
            configured: !!GEMINI_API_KEY,
            model: 'gemini-2.0-flash-maximized',
            generation: MAXIMIZED_GEMINI_CONFIG
        },
        features: MAXIMIZED_APP_CONFIG.features,
        performance: MAXIMIZED_APP_CONFIG.performance,
        security: MAXIMIZED_APP_CONFIG.security,
        rateLimiting: MAXIMIZED_APP_CONFIG.rateLimiting,
        limits: {
            maxQuestionLength: MAXIMIZED_APP_CONFIG.maxQuestionLength,
            maxContextItems: MAXIMIZED_APP_CONFIG.maxContextItems,
            maxSessionsPerUser: MAXIMIZED_APP_CONFIG.maxSessionsPerUser,
            maxMessagesPerSession: MAXIMIZED_APP_CONFIG.maxMessagesPerSession
        },
        monitoring: MAXIMIZED_APP_CONFIG.monitoring
    })
};