// controllers/authController.js
const userModel = require('../models/userModel');

class AuthController {
    // Show login page
    showLogin(req, res) {
        // If already logged in, redirect to chat
        if (req.user) {
            return res.redirect('/chat');
        }

        res.render('auth/login', {
            title: 'Login - Tanya AI',
            error: null
        });
    }

    // Show register page
    showRegister(req, res) {
        // If already logged in, redirect to chat
        if (req.user) {
            return res.redirect('/chat');
        }

        res.render('auth/register', {
            title: 'Daftar - Tanya AI',
            error: null
        });
    }

    // Handle login
    async handleLogin(req, res) {
        try {
            const { username, password, remember } = req.body;

            // Validation
            if (!username || !password) {
                return res.status(400).render('auth/login', {
                    title: 'Login - Tanya AI',
                    error: 'Username dan password harus diisi'
                });
            }

            // Authenticate user
            const authResult = await userModel.authenticateUser(username, password);
            if (!authResult.success) {
                return res.status(401).render('auth/login', {
                    title: 'Login - Tanya AI',
                    error: authResult.message
                });
            }

            // Create session
            const sessionResult = await userModel.createSession(authResult.user.id);
            if (!sessionResult.success) {
                return res.status(500).render('auth/login', {
                    title: 'Login - Tanya AI',
                    error: 'Gagal membuat session'
                });
            }

            // Set cookie
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            };

            if (remember) {
                cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            }

            res.cookie('sessionId', sessionResult.sessionId, cookieOptions);

            // JSON response for AJAX or redirect for form
            if (req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    message: 'Login berhasil',
                    user: authResult.user,
                    redirect: '/chat'
                });
            }

            res.redirect('/chat');

        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).render('auth/login', {
                title: 'Login - Tanya AI',
                error: 'Terjadi kesalahan sistem'
            });
        }
    }

    // Handle register
    async handleRegister(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;

            // Validation
            if (!username || !email || !password || !confirmPassword) {
                return res.status(400).render('auth/register', {
                    title: 'Daftar - Tanya AI',
                    error: 'Semua field harus diisi'
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).render('auth/register', {
                    title: 'Daftar - Tanya AI',
                    error: 'Password tidak cocok'
                });
            }

            if (password.length < 6) {
                return res.status(400).render('auth/register', {
                    title: 'Daftar - Tanya AI',
                    error: 'Password minimal 6 karakter'
                });
            }

            // Create user
            const createResult = await userModel.createUser(username, password, email);
            if (!createResult.success) {
                return res.status(400).render('auth/register', {
                    title: 'Daftar - Tanya AI',
                    error: createResult.message
                });
            }

            // Auto login after register
            const sessionResult = await userModel.createSession(createResult.user.id);
            if (sessionResult.success) {
                res.cookie('sessionId', sessionResult.sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
            }

            // JSON response for AJAX or redirect for form
            if (req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    message: 'Registrasi berhasil',
                    user: createResult.user,
                    redirect: '/chat'
                });
            }

            res.redirect('/chat');

        } catch (error) {
            console.error('❌ Register error:', error);
            res.status(500).render('auth/register', {
                title: 'Daftar - Tanya AI',
                error: 'Terjadi kesalahan sistem'
            });
        }
    }

    // Handle logout
    async handleLogout(req, res) {
        try {
            const sessionId = req.cookies?.sessionId;

            if (sessionId) {
                await userModel.destroySession(sessionId);
            }

            res.clearCookie('sessionId');

            // JSON response for AJAX or redirect for form
            if (req.headers.accept?.includes('application/json')) {
                return res.json({
                    success: true,
                    message: 'Logout berhasil',
                    redirect: '/login'
                });
            }

            res.redirect('/login');

        } catch (error) {
            console.error('❌ Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat logout'
            });
        }
    }

    // Get user info
    getUserInfo(req, res) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const chatQuota = userModel.canUserChat(req.user.id);

        res.json({
            success: true,
            user: {
                ...req.user,
                chatQuota
            }
        });
    }

    // Admin: Get all users
    getAllUsers(req, res) {
        try {
            const users = userModel.getAllUsers();
            res.json({
                success: true,
                users
            });
        } catch (error) {
            console.error('❌ Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data users'
            });
        }
    }

    // Admin: Update user limit
    async updateUserLimit(req, res) {
        try {
            const { username, limit } = req.body;

            if (!username || limit === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Username dan limit harus diisi'
                });
            }

            const result = await userModel.updateUserLimit(username, parseInt(limit));
            res.json(result);

        } catch (error) {
            console.error('❌ Update limit error:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal update limit'
            });
        }
    }
}

module.exports = new AuthController();
