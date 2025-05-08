/**
 * Konfigurasi aplikasi AnaphygonAsk
 */

// Konfigurasi mode debug
const DEBUG_MODE = true;

// Konfigurasi Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBSHWompvEBuU5v4AE1LS3THWUX2o57X9o';
const GEMINI_GENERATION_CONFIG = {
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.8,
    topK: 40
};

// Konfigurasi aplikasi
const APP_CONFIG = {
    appName: 'AnaphygonAsk',
    description: 'Website tanya jawab AI dengan Gemini API',
    footerText: `© ${new Date().getFullYear()} AnaphygonAsk - Powered by Gemini AI`
};

// Export konfigurasi
module.exports = {
    DEBUG_MODE,
    GEMINI_API_KEY,
    GEMINI_GENERATION_CONFIG,
    APP_CONFIG
};