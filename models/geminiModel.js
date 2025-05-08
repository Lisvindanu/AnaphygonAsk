/**
 * Model untuk komunikasi dengan Gemini API menggunakan axios
 */
const axios = require('axios');
const config = require('../config/config');

class GeminiModel {
    constructor() {
        // Base URL untuk API Gemini
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.apiKey = config.GEMINI_API_KEY;

        // Database jawaban fallback
        this.fallbackResponses = {
            'hai': 'Halo! Saya asisten AI dari AnaphygonAsk. Apa yang bisa saya bantu hari ini?',
            'halo': 'Hai! Saya asisten AI dari AnaphygonAsk. Apa yang bisa saya bantu hari ini?',
            'siapa kamu': 'Saya adalah asisten AI dari AnaphygonAsk, dibuat untuk menjawab pertanyaan Anda.',
            'apa itu ai': 'AI (Artificial Intelligence) atau Kecerdasan Buatan adalah teknologi yang memungkinkan komputer untuk belajar dari pengalaman, menyesuaikan dengan input baru, dan melakukan tugas-tugas seperti manusia.',
            'apa itu gemini': 'Gemini adalah model AI multimodal dari Google yang dapat memahami dan memproses berbagai jenis input termasuk teks, gambar, audio, dan video.',
            'apa kabar': 'Saya baik-baik saja, terima kasih telah bertanya! Bagaimana dengan Anda?',
            'terima kasih': 'Sama-sama! Senang bisa membantu.',
            'bagaimana cara membuat website': 'Untuk membuat website, Anda perlu mempelajari HTML, CSS, dan JavaScript sebagai dasar. Kemudian Anda bisa menggunakan framework seperti React, Vue, atau Angular untuk pengembangan lebih lanjut.',
            'bandung': 'Bandung adalah ibu kota Provinsi Jawa Barat, Indonesia. Kota ini terkenal dengan cuaca yang sejuk, kuliner lezat, dan pusat mode. Bandung juga dijuluki sebagai Paris van Java dan Kota Kembang.',
            'laper': 'Jika Anda lapar, mungkin ini saatnya untuk makan sesuatu. Ada banyak makanan enak di Bandung yang bisa dicoba!',
            'langit': 'Langit umumnya berwarna biru di siang hari karena molekul udara menyebarkan cahaya biru dari matahari lebih banyak daripada warna lainnya. Pada saat sunset, langit bisa menjadi merah, oranye atau ungu.'
        };

        console.log('GeminiModel initialized with model: gemini-2.0-flash via direct API');
    }

    /**
     * Mengirim pertanyaan ke Gemini API menggunakan axios
     * @param {string} question - Pertanyaan dari pengguna
     * @returns {Promise<object>} - Objek respons dengan status dan pesan
     */
    async askQuestion(question) {
        try {
            console.log(`Sending question to Gemini API: ${question}`);

            // Persiapkan URL dengan API key
            const url = `${this.apiUrl}?key=${this.apiKey}`;

            // Persiapkan payload sesuai dengan dokumentasi
            const payload = {
                contents: [
                    {
                        parts: [
                            {
                                text: question
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.8,
                    topK: 40
                }
            };

            // Kirim request ke API
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Parse respons
            const generatedText = response.data.candidates[0].content.parts[0].text;
            console.log(`Received response from Gemini API: ${generatedText.substring(0, 50)}...`);

            return {
                success: true,
                message: generatedText
            };
        } catch (error) {
            console.error('Error querying Gemini API:', error);

            // Jika error, log detail untuk debugging
            if (error.response) {
                // Server merespons dengan kode status error
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                // Request dibuat tapi tidak ada respons
                console.error('No response received:', error.request);
            } else {
                // Kesalahan saat setup request
                console.error('Request error:', error.message);
            }

            // Gunakan fallback response
            const fallbackResponse = this.getFallbackResponse(question);

            return {
                success: true, // Tetap berhasil meskipun menggunakan fallback
                message: fallbackResponse.message,
                error: error.message // Kirim pesan error untuk debug
            };
        }
    }

    /**
     * Mendapatkan respons fallback jika API gagal
     * @param {string} question - Pertanyaan dari pengguna
     * @returns {object} - Objek respons fallback
     */
    getFallbackResponse(question) {
        const lowerQuestion = question.toLowerCase();

        // Cari di database respons
        for (const [keyword, response] of Object.entries(this.fallbackResponses)) {
            if (lowerQuestion.includes(keyword)) {
                return {
                    success: true,
                    message: response
                };
            }
        }

        // Respons default jika tidak ditemukan kecocokan
        return {
            success: true,
            message: 'Maaf, saya tidak dapat terhubung ke server AI saat ini. Silakan coba lagi nanti atau tanyakan hal lain yang mungkin dapat saya jawab dengan pengetahuan yang terbatas.'
        };
    }
}

module.exports = new GeminiModel();