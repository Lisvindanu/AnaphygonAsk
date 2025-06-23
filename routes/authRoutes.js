// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/login', AuthMiddleware.optionalAuth, authController.showLogin);
router.get('/register', AuthMiddleware.optionalAuth, authController.showRegister);
router.post('/login', authController.handleLogin);
router.post('/register', authController.handleRegister);

// Protected routes
router.post('/logout', authController.handleLogout);
router.get('/user', AuthMiddleware.requireAuth, authController.getUserInfo);

// Admin routes
router.get('/admin/users', AuthMiddleware.requireAuth, AuthMiddleware.requireAdmin, authController.getAllUsers);
router.post('/admin/users/limit', AuthMiddleware.requireAuth, AuthMiddleware.requireAdmin, authController.updateUserLimit);

module.exports = router;