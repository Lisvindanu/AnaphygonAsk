/**
 * Enhanced Model untuk komunikasi dengan Gemini API dengan prompting yang lebih baik
 * UPGRADED VERSION - Optimized for better responses
 */
const axios = require('axios');
const config = require('../config/config');

class GeminiModel {
    constructor() {
        // Base URL untuk API Gemini
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.apiKey = config.GEMINI_API_KEY;

        // UPGRADED: System prompt yang lebih efektif (disingkat dari versi sebelumnya)
        this.systemPrompt = `Anda adalah asisten AI yang ramah dan membantu dari AnaphygonAsk.

Karakteristik:
- Ramah dan mudah dipahami
- Menggunakan bahasa Indonesia yang natural
- Memberikan jawaban yang informatif dan akurat
- Gunakan emoji secukupnya untuk membuat percakapan menarik

Cara merespons:
- Jawab pertanyaan dengan lengkap dan jelas
- Jika tidak yakin, katakan dengan jujur
- Berikan contoh praktis jika memungkinkan
- Untuk topik kompleks, pecah menjadi poin-poin mudah dipahami

Selalu berikan jawaban yang bermanfaat!`;

        // Enhanced fallback responses dengan variasi (TETAP DIPERTAHANKAN)
        this.fallbackResponses = {
            'hai': [
                'Halo! 👋 Saya asisten AI dari AnaphygonAsk. Ada yang bisa saya bantu hari ini?',
                'Hai there! Senang bertemu dengan Anda. Apa yang ingin kita bahas?',
                'Hello! Saya siap membantu menjawab pertanyaan Anda. Silakan tanya apa saja! 😊'
            ],
            'halo': [
                'Halo! Selamat datang di AnaphygonAsk! 🌟 Apa yang bisa saya bantu?',
                'Hai! Saya asisten AI yang siap membantu. Ada pertanyaan untuk saya?'
            ],
            'siapa kamu': [
                'Saya adalah asisten AI dari AnaphygonAsk yang ditenagai oleh teknologi Gemini dari Google. Saya dibuat untuk membantu menjawab berbagai pertanyaan dan memberikan informasi yang bermanfaat! 🤖',
                'Perkenalkan, saya AI assistant AnaphygonAsk! Saya bisa membantu dengan berbagai topik mulai dari pengetahuan umum, teknologi, hingga tips praktis sehari-hari.'
            ],
            'terima kasih': [
                'Sama-sama! 😊 Senang bisa membantu. Ada pertanyaan lain?',
                'Dengan senang hati! Jangan ragu untuk bertanya lagi kapan saja.',
                'You\'re welcome! Saya di sini kalau butuh bantuan lagi. 👍'
            ],
            'bagaimana kabar': [
                'Saya baik-baik saja, terima kasih sudah bertanya! 😄 Sebagai AI, saya selalu siap membantu 24/7. Bagaimana dengan Anda?',
                'Kabar saya baik! Saya semangat membantu Anda hari ini. Ada yang ingin ditanyakan?'
            ],
            'apa itu ai': [
                'AI atau Artificial Intelligence adalah teknologi yang memungkinkan komputer untuk "berpikir" dan membuat keputusan seperti manusia. AI belajar dari data dan pengalaman untuk:\n\n🧠 Memahami bahasa natural\n🔍 Mengenali pola\n💡 Memecahkan masalah\n📊 Menganalisis informasi\n\nContoh AI yang sering kita gunakan: asisten virtual, rekomendasi Netflix, Google Translate, dan tentu saja saya! 😉'
            ],
            'programming': [
                'Programming atau pemrograman adalah proses membuat instruksi untuk komputer dalam bahasa yang bisa dimengerti. Beberapa bahasa populer:\n\n🐍 Python - mudah dipelajari, cocok untuk AI/data science\n☕ JavaScript - untuk web development\n⚡ Java - robust untuk aplikasi enterprise\n🚀 Go - cepat dan efisien\n\nMau belajar programming? Mulai dari Python atau JavaScript! Ada yang spesifik yang ingin ditanyakan?'
            ],
            'bandung': [
                'Bandung adalah kota yang amazing! 🌟 Sebagai ibu kota Jawa Barat, Bandung terkenal dengan:\n\n🏔️ Cuaca sejuk pegunungan\n🍜 Kuliner lezat (siomay, batagor, gudeg Bandung)\n👗 Pusat fashion dan factory outlet\n🎨 Komunitas kreatif yang aktif\n🏛️ Arsitektur Art Deco yang indah\n🎓 Kota pelajar dengan banyak universitas\n\nAda tempat spesifik di Bandung yang ingin ditanyakan?'
            ]
        };

        console.log('Enhanced GeminiModel initialized with UPGRADED prompting system');
    }

    /**
     * UPGRADED: Mengirim pertanyaan ke Gemini API dengan optimasi yang lebih baik
     * @param {string} question - Pertanyaan dari pengguna
     * @param {Array} context - Context percakapan sebelumnya
     * @returns {Promise<object>} - Objek respons dengan status dan pesan
     */
    async askQuestion(question, context = []) {
        try {
            console.log(`Sending enhanced question to Gemini API: ${question.substring(0, 100)}...`);

            // Persiapkan URL dengan API key
            const url = `${this.apiUrl}?key=${this.apiKey}`;

            // UPGRADED: Build enhanced prompt dengan optimasi
            const enhancedPrompt = this.buildOptimizedPrompt(question, context);

            // UPGRADED: Persiapkan payload dengan konfigurasi yang dioptimalkan
            const payload = {
                contents: [
                    {
                        parts: [
                            {
                                text: enhancedPrompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,        // UPGRADED: Lebih konsisten dari 0.8
                    maxOutputTokens: 2000,   // UPGRADED: Lebih efisien dari 3000
                    topP: 0.8,              // UPGRADED: Lebih fokus dari 0.9
                    topK: 30,               // UPGRADED: Lebih selektif dari 40
                    candidateCount: 1,
                    stopSequences: ["<|end|>"]
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };

            // UPGRADED: Kirim request ke API dengan timeout yang lebih pendek
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 25000 // UPGRADED: 25 detik timeout dari 30 detik
            });

            // Parse respons dengan error handling yang lebih baik
            if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('No response candidates received from API');
            }

            const candidate = response.data.candidates[0];

            // Check for content filtering
            if (candidate.finishReason === 'SAFETY') {
                return {
                    success: true,
                    message: 'Maaf, saya tidak dapat menjawab pertanyaan tersebut karena berkaitan dengan konten yang tidak sesuai. Silakan coba pertanyaan lain yang lebih umum.'
                };
            }

            // UPGRADED: Check for recitation
            if (candidate.finishReason === 'RECITATION') {
                return {
                    success: true,
                    message: 'Maaf, saya tidak dapat memberikan informasi tersebut. Ada pertanyaan lain yang bisa saya bantu?'
                };
            }

            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Invalid response structure from API');
            }

            const generatedText = candidate.content.parts[0].text;

            if (!generatedText || generatedText.trim().length === 0) {
                throw new Error('Empty response from API');
            }

            console.log(`Received enhanced response from Gemini API: ${generatedText.substring(0, 100)}...`);

            return {
                success: true,
                message: this.postProcessResponse(generatedText),
                metadata: {
                    model: 'gemini-2.0-flash',
                    finishReason: candidate.finishReason,
                    promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
                    completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
                    // UPGRADED: Tambahan metadata
                    isOptimized: true,
                    version: 'upgraded'
                }
            };

        } catch (error) {
            console.error('Error querying Enhanced Gemini API:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Enhanced error handling dengan fallback yang lebih pintar
            return this.getEnhancedFallbackResponse(question, error);
        }
    }

    /**
     * UPGRADED: Build optimized prompt (lebih efisien dari versi sebelumnya)
     * @param {string} question - Pertanyaan user
     * @param {Array} context - Context percakapan
     * @returns {string} Enhanced prompt
     */
    buildOptimizedPrompt(question, context = []) {
        let prompt = this.systemPrompt + '\n\n';

        // UPGRADED: Tambahkan context yang lebih efisien (hanya 4 pesan terakhir, bukan 8)
        if (context && context.length > 0) {
            prompt += 'CONTEXT PERCAKAPAN:\n';
            const recentContext = context.slice(-4); // UPGRADED: Dari 8 menjadi 4

            recentContext.forEach(msg => {
                const role = msg.isUser ? 'User' : 'Assistant';
                const text = msg.text.substring(0, 150); // UPGRADED: Dari 300 menjadi 150 karakter
                prompt += `${role}: ${text}\n`;
            });

            prompt += '\n';
        }

        // UPGRADED: Pertanyaan dengan format yang lebih sederhana
        prompt += `PERTANYAAN: ${question}\n\n`;
        prompt += 'INSTRUKSI: Jawab dengan bahasa Indonesia yang jelas dan informatif.';

        return prompt;
    }

    /**
     * UPGRADED: Build enhanced prompt dengan system message dan context (TETAP DIPERTAHANKAN untuk backward compatibility)
     * @param {string} question - Pertanyaan user
     * @param {Array} context - Context percakapan
     * @returns {string} Enhanced prompt
     */
    buildEnhancedPrompt(question, context = []) {
        // UPGRADED: Gunakan versi yang dioptimalkan
        return this.buildOptimizedPrompt(question, context);
    }

    /**
     * UPGRADED: Post-process response untuk memperbaiki format
     * @param {string} text - Raw response dari API
     * @returns {string} Processed response
     */
    postProcessResponse(text) {
        // Hapus markup yang tidak perlu
        text = text.replace(/\*\*(.*?)\*\*/g, '**$1**'); // Biarkan bold formatting
        text = text.replace(/\*(.*?)\*/g, '*$1*'); // Biarkan italic formatting

        // UPGRADED: Perbaiki spasi dan line breaks yang lebih baik
        text = text.replace(/\n{3,}/g, '\n\n'); // Maksimal 2 line breaks berturut-turut
        text = text.replace(/^\s+|\s+$/g, ''); // Trim whitespace

        // UPGRADED: Hapus redundant spaces
        text = text.replace(/[ \t]+/g, ' '); // Multiple spaces menjadi single space

        // Perbaiki formatting list
        text = text.replace(/\n-\s/g, '\n• '); // Ganti dash dengan bullet
        text = text.replace(/\n\*\s/g, '\n• '); // Ganti asterisk dengan bullet

        return text;
    }

    /**
     * UPGRADED: Enhanced fallback response dengan variasi dan konteks
     * @param {string} question - Pertanyaan user
     * @param {Error} error - Error yang terjadi
     * @returns {object} Fallback response
     */
    getEnhancedFallbackResponse(question, error) {
        const lowerQuestion = question.toLowerCase();

        // Cek apakah ada keyword yang cocok
        for (const [keyword, responses] of Object.entries(this.fallbackResponses)) {
            if (lowerQuestion.includes(keyword)) {
                const randomResponse = Array.isArray(responses)
                    ? responses[Math.floor(Math.random() * responses.length)]
                    : responses;

                return {
                    success: true,
                    message: randomResponse,
                    fallback: true,
                    // UPGRADED: Tambahan metadata
                    fallbackType: 'keyword_match',
                    keyword: keyword
                };
            }
        }

        // UPGRADED: Enhanced default responses berdasarkan tipe error
        let fallbackMessage;
        let fallbackType = 'generic_error';

        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            fallbackMessage = 'Maaf, koneksi ke server AI sedang bermasalah. 😔 Coba lagi dalam beberapa saat atau ajukan pertanyaan yang lebih spesifik.';
            fallbackType = 'connection_error';
        } else if (error.response?.status === 429) {
            fallbackMessage = 'Ups! Terlalu banyak pertanyaan dalam waktu singkat. ⏰ Mari ambil jeda sebentar, lalu coba lagi. 😊';
            fallbackType = 'rate_limit';
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            fallbackMessage = 'Sepertinya ada masalah dengan konfigurasi sistem. 🔧 Tim teknis sedang menanganinya. Coba lagi dalam beberapa menit ya!';
            fallbackType = 'auth_error';
        } else {
            fallbackMessage = `Maaf, saya sedang mengalami kesulitan teknis untuk menjawab pertanyaan Anda. 😅 

Beberapa hal yang bisa Anda coba:
• Coba ajukan pertanyaan dengan kata-kata yang berbeda
• Pastikan pertanyaan tidak terlalu panjang atau kompleks
• Tunggu sebentar lalu coba lagi

Saya siap membantu dengan berbagai topik seperti:
🔹 Pengetahuan umum
🔹 Teknologi & programming  
🔹 Tips praktis sehari-hari
🔹 Budaya & sejarah Indonesia

Ada yang bisa saya bantu dengan topik-topik di atas?`;
            fallbackType = 'generic_error';
        }

        return {
            success: true,
            message: fallbackMessage,
            fallback: true,
            fallbackType: fallbackType,
            error: config.DEBUG_MODE ? error.message : undefined
        };
    }

    /**
     * Validate question sebelum dikirim ke API (TETAP DIPERTAHANKAN)
     * @param {string} question - Pertanyaan user
     * @returns {object} Validation result
     */
    validateQuestion(question) {
        if (!question || typeof question !== 'string') {
            return { isValid: false, message: 'Pertanyaan harus berupa text' };
        }

        if (question.trim().length === 0) {
            return { isValid: false, message: 'Pertanyaan tidak boleh kosong' };
        }

        if (question.length > 5000) {
            return { isValid: false, message: 'Pertanyaan terlalu panjang (maksimal 5000 karakter)' };
        }

        // UPGRADED: Cek konten yang tidak pantas (enhanced)
        const inappropriateWords = ['spam', 'scam', 'hack', 'phishing'];
        const hasInappropriate = inappropriateWords.some(word =>
            question.toLowerCase().includes(word)
        );

        if (hasInappropriate) {
            return { isValid: false, message: 'Pertanyaan mengandung konten yang tidak sesuai' };
        }

        // UPGRADED: Check for excessive repetition
        if (/(.{10,})\1{3,}/.test(question)) {
            return { isValid: false, message: 'Format pertanyaan tidak valid - terlalu banyak pengulangan' };
        }

        return { isValid: true };
    }

    // UPGRADED: Tambahan method untuk monitoring performance
    getStats() {
        return {
            model: 'gemini-2.0-flash',
            version: 'upgraded',
            optimizations: [
                'Reduced temperature to 0.4',
                'Limited context to 4 messages',
                'Reduced maxOutputTokens to 2000',
                'Improved topK to 30',
                'Enhanced error handling',
                'Better prompt structure'
            ]
        };
    }
}

module.exports = new GeminiModel();