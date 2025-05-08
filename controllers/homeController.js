/**
 * Controller untuk halaman utama/home
 */
const config = require('../config/config');

// Controller untuk halaman home
const homeController = {
    /**
     * Menampilkan halaman utama
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    index: (req, res) => {
        res.render('home', {
            title: 'Beranda',
            config: config.APP_CONFIG
        });
    }
};

module.exports = homeController;