/**
 * UPGRADED Konfigurasi aplikasi AnaphygonAsk
 * Enhanced version with better validation and monitoring
 */

// UPGRADED: Enhanced validation with better error messages
function validateConfig() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY tidak ditemukan di environment variables');
        console.error('💡 Pastikan file .env ada dan berisi GEMINI_API_KEY=your_api_key');
        process.exit(1);
    }

    if (!apiKey.startsWith('AIza')) {
        console.warn('⚠️  Format API key mungkin tidak valid - harus dimulai dengan "AIza"');
        console.warn('💡 Periksa kembali API key dari Google AI Studio');
    }

    // UPGRADED: Additional validation
    if (apiKey.length < 35) {
        console.warn('⚠️  API key terlihat terlalu pendek');
    }

    if (apiKey === 'your_api_key_here' || apiKey === 'AIzaSyBSHWompvEBuU5v4AE1LS3THWUX2o57X9o') {
        console.error('❌ Menggunakan API key placeholder/contoh. Ganti dengan API key yang valid!');
        process.exit(1);
    }

    console.log('✅ API key validation passed');
    return apiKey;
}

// UPGRADED: Enhanced debug mode detection
const DEBUG_MODE = process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true';

// UPGRADED: Konfigurasi Gemini API yang optimal
const GEMINI_API_KEY = validateConfig();
const GEMINI_GENERATION_CONFIG = {
    temperature: 0.4,        // UPGRADED: Lebih konsisten dari 0.7
    maxOutputTokens: 2000,   // UPGRADED: Optimal balance
    topP: 0.8,              // UPGRADED: Fokus yang baik
    topK: 30                // UPGRADED: Lebih selektif dari 40
};

// UPGRADED: Konfigurasi aplikasi dengan validasi dan monitoring
const APP_CONFIG = {
    appName: 'AnaphygonAsk',
    version: '2.2.0', // UPGRADED: Version bump
    description: 'Website tanya jawab AI dengan Gemini API - Upgraded Enhanced Version',
    footerText: `© ${new Date().getFullYear()} AnaphygonAsk - Powered by Gemini AI`,

    // UPGRADED: Optimized limits
    maxQuestionLength: 2000,
    maxContextItems: 20,
    maxContextItemLength: 150, // UPGRADED: New limit
    rateLimitWindow: 60 * 1000, // 1 menit
    rateLimitMax: 10,           // 10 requests per menit

    // UPGRADED: Enhanced feature flags
    features: {
        enableContextHistory: true,
        enableMarkdownParsing: true,
        enableFallbackResponses: true,
        enableDebugLogging: DEBUG_MODE,
        enableResponseTiming: true,        // UPGRADED: New feature
        enableErrorTyping: true,          // UPGRADED: New feature
        enableHealthChecks: true,         // UPGRADED: New feature
        enableOptimizedPrompts: true      // UPGRADED: New feature
    },

    // UPGRADED: Performance monitoring
    performance: {
        maxResponseTime: 30000,    // 30 seconds
        warningResponseTime: 15000, // 15 seconds
        enableMetrics: DEBUG_MODE
    },

    // UPGRADED: Error handling configuration
    errorHandling: {
        enableDetailedErrors: DEBUG_MODE,
        enableErrorTypes: true,
        enableFallbackChain: true
    }
};

// UPGRADED: Enhanced logging with better formatting
if (DEBUG_MODE) {
    console.log('\n🔧 UPGRADED Configuration loaded:');
    console.log('├── App Name:', APP_CONFIG.appName);
    console.log('├── Version:', APP_CONFIG.version);
    console.log('├── Debug Mode:', DEBUG_MODE);
    console.log('├── API Key:', GEMINI_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('├── Features:');
    Object.entries(APP_CONFIG.features).forEach(([key, value]) => {
        console.log(`│   ├── ${key}: ${value ? '✅' : '❌'}`);
    });
    console.log('├── Generation Config:');
    Object.entries(GEMINI_GENERATION_CONFIG).forEach(([key, value]) => {
        console.log(`│   ├── ${key}: ${value}`);
    });
    console.log('└── Performance:');
    console.log(`    ├── Max Response Time: ${APP_CONFIG.performance.maxResponseTime}ms`);
    console.log(`    └── Warning Threshold: ${APP_CONFIG.performance.warningResponseTime}ms\n`);
}

// UPGRADED: Export dengan enhanced functionality
module.exports = {
    DEBUG_MODE,
    GEMINI_API_KEY,
    GEMINI_GENERATION_CONFIG,
    APP_CONFIG,

    // UPGRADED: Enhanced helper functions
    isProduction: () => process.env.NODE_ENV === 'production',
    isDevelopment: () => process.env.NODE_ENV !== 'production',
    getApiKey: () => GEMINI_API_KEY,

    // UPGRADED: Enhanced validation helper
    validateApiKey: () => {
        return GEMINI_API_KEY &&
            GEMINI_API_KEY.length > 30 &&
            GEMINI_API_KEY.startsWith('AIza') &&
            GEMINI_API_KEY !== 'your_api_key_here';
    },

    // UPGRADED: New helper functions
    getVersion: () => APP_CONFIG.version,

    isFeatureEnabled: (featureName) => {
        return APP_CONFIG.features[featureName] || false;
    },

    getPerformanceConfig: () => APP_CONFIG.performance,

    getErrorConfig: () => APP_CONFIG.errorHandling,

    // UPGRADED: Configuration validation
    validateConfiguration: () => {
        const issues = [];

        if (!GEMINI_API_KEY) {
            issues.push('API Key missing');
        }

        if (!GEMINI_API_KEY.startsWith('AIza')) {
            issues.push('Invalid API Key format');
        }

        if (APP_CONFIG.maxQuestionLength < 100) {
            issues.push('Question length limit too low');
        }

        if (APP_CONFIG.rateLimitMax < 1) {
            issues.push('Rate limit too restrictive');
        }

        return {
            isValid: issues.length === 0,
            issues: issues
        };
    },

    // UPGRADED: Runtime configuration updates
    updateFeature: (featureName, enabled) => {
        if (APP_CONFIG.features.hasOwnProperty(featureName)) {
            APP_CONFIG.features[featureName] = enabled;
            if (DEBUG_MODE) {
                console.log(`🔧 Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
            }
            return true;
        }
        return false;
    },

    // UPGRADED: Get full configuration for health checks
    getFullConfig: () => ({
        app: {
            name: APP_CONFIG.appName,
            version: APP_CONFIG.version,
            description: APP_CONFIG.description
        },
        api: {
            configured: validateConfig !== null,
            model: 'gemini-2.0-flash'
        },
        features: APP_CONFIG.features,
        performance: APP_CONFIG.performance,
        limits: {
            maxQuestionLength: APP_CONFIG.maxQuestionLength,
            maxContextItems: APP_CONFIG.maxContextItems,
            rateLimitWindow: APP_CONFIG.rateLimitWindow,
            rateLimitMax: APP_CONFIG.rateLimitMax
        },
        generation: GEMINI_GENERATION_CONFIG
    })
};