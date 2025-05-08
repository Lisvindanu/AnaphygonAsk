/**
 * Controller untuk halaman chat dan fungsi AI
 */
const geminiModel = require('../models/geminiModel');
const config = require('../config/config');

// Controller untuk chat
const chatController = {
    /**
     * Menampilkan halaman chat
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    showChat: (req, res) => {
        res.render('chat', {
            title: 'Tanya AI',
            config: config.APP_CONFIG
        });
    },

    /**
     * Memproses pertanyaan ke AI dan mengembalikan respons
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    processQuestion: async (req, res) => {
        try {
            // Log request jika dalam mode debug
            if (config.DEBUG_MODE) {
                console.log('Received chat request:', req.body);
            }

            // Validasi request
            if (!req.body.question) {
                return res.status(400).json({
                    success: false,
                    message: 'Pertanyaan tidak boleh kosong'
                });
            }

            // Ambil pertanyaan dari request
            const { question } = req.body;

            // Kirim pertanyaan ke model Gemini
            const response = await geminiModel.askQuestion(question);

            // Kirim respons ke client
            return res.json(response);
        } catch (error) {
            console.error('Error in processQuestion:', error);

            // Kirim respons error
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat memproses pertanyaan',
                error: error.message
            });
        }
    }
};

module.exports = chatController;