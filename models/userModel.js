// models/userModel.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

class UserModel {
    constructor() {
        this.usersFile = path.join(__dirname, '../data/users.json');
        this.sessionsFile = path.join(__dirname, '../data/sessions.json');
        this.users = new Map();
        this.sessions = new Map();
        this.initializeData();
    }

    async initializeData() {
        try {
            // Create data directory if not exists
            await fs.mkdir(path.dirname(this.usersFile), { recursive: true });

            // Load users
            try {
                const userData = await fs.readFile(this.usersFile, 'utf8');
                const users = JSON.parse(userData);
                users.forEach(user => this.users.set(user.username, user));
            } catch (err) {
                // File doesn't exist, create empty users file
                await this.saveUsers();
            }

            // Load sessions
            try {
                const sessionData = await fs.readFile(this.sessionsFile, 'utf8');
                const sessions = JSON.parse(sessionData);
                sessions.forEach(session => this.sessions.set(session.sessionId, session));
            } catch (err) {
                // File doesn't exist, create empty sessions file
                await this.saveSessions();
            }

            console.log('✅ User data initialized');
        } catch (error) {
            console.error('❌ Failed to initialize user data:', error);
        }
    }

    async saveUsers() {
        try {
            const userData = Array.from(this.users.values());
            await fs.writeFile(this.usersFile, JSON.stringify(userData, null, 2));
        } catch (error) {
            console.error('❌ Failed to save users:', error);
        }
    }

    async saveSessions() {
        try {
            const sessionData = Array.from(this.sessions.values());
            await fs.writeFile(this.sessionsFile, JSON.stringify(sessionData, null, 2));
        } catch (error) {
            console.error('❌ Failed to save sessions:', error);
        }
    }

    // User registration
    async createUser(username, password, email) {
        try {
            // Check if user already exists
            if (this.users.has(username)) {
                return { success: false, message: 'Username sudah digunakan' };
            }

            // Check email
            const existingEmail = Array.from(this.users.values())
                .find(user => user.email === email);
            if (existingEmail) {
                return { success: false, message: 'Email sudah terdaftar' };
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const user = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                username,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                chatLimit: 50, // Default chat limit per day
                dailyUsage: 0,
                lastUsageReset: new Date().toDateString(),
                isActive: true,
                role: 'user'
            };

            this.users.set(username, user);
            await this.saveUsers();

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword };

        } catch (error) {
            console.error('❌ Create user error:', error);
            return { success: false, message: 'Gagal membuat akun' };
        }
    }

    // User login
    async authenticateUser(username, password) {
        try {
            const user = this.users.get(username);
            if (!user) {
                return { success: false, message: 'Username tidak ditemukan' };
            }

            if (!user.isActive) {
                return { success: false, message: 'Akun tidak aktif' };
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return { success: false, message: 'Password salah' };
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            await this.saveUsers();

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword };

        } catch (error) {
            console.error('❌ Authentication error:', error);
            return { success: false, message: 'Gagal login' };
        }
    }

    // Create session
    async createSession(userId) {
        try {
            const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const session = {
                sessionId,
                userId,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                isActive: true
            };

            this.sessions.set(sessionId, session);
            await this.saveSessions();

            return { success: true, sessionId };
        } catch (error) {
            console.error('❌ Create session error:', error);
            return { success: false, message: 'Gagal membuat session' };
        }
    }

    // Validate session
    validateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isActive) {
            return { valid: false, message: 'Session tidak valid' };
        }

        if (new Date() > new Date(session.expiresAt)) {
            session.isActive = false;
            this.saveSessions();
            return { valid: false, message: 'Session expired' };
        }

        return { valid: true, session };
    }

    // Get user by session
    getUserBySession(sessionId) {
        const sessionValidation = this.validateSession(sessionId);
        if (!sessionValidation.valid) {
            return null;
        }

        const user = Array.from(this.users.values())
            .find(u => u.id === sessionValidation.session.userId);

        if (!user) return null;

        // Check daily usage reset
        const today = new Date().toDateString();
        if (user.lastUsageReset !== today) {
            user.dailyUsage = 0;
            user.lastUsageReset = today;
            this.saveUsers();
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Destroy session
    async destroySession(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (session) {
                session.isActive = false;
                await this.saveSessions();
            }
            return { success: true };
        } catch (error) {
            console.error('❌ Destroy session error:', error);
            return { success: false };
        }
    }

    // Update user chat usage
    async incrementChatUsage(userId) {
        try {
            const user = Array.from(this.users.values()).find(u => u.id === userId);
            if (!user) return { success: false, message: 'User tidak ditemukan' };

            // Check daily reset
            const today = new Date().toDateString();
            if (user.lastUsageReset !== today) {
                user.dailyUsage = 0;
                user.lastUsageReset = today;
            }

            user.dailyUsage++;
            await this.saveUsers();

            return {
                success: true,
                usage: user.dailyUsage,
                limit: user.chatLimit,
                remaining: user.chatLimit - user.dailyUsage
            };
        } catch (error) {
            console.error('❌ Increment usage error:', error);
            return { success: false, message: 'Gagal update usage' };
        }
    }

    // Check if user can chat
    canUserChat(userId) {
        const user = Array.from(this.users.values()).find(u => u.id === userId);
        if (!user) return { canChat: false, message: 'User tidak ditemukan' };

        // Check daily reset
        const today = new Date().toDateString();
        if (user.lastUsageReset !== today) {
            user.dailyUsage = 0;
            user.lastUsageReset = today;
            this.saveUsers();
        }

        if (user.dailyUsage >= user.chatLimit) {
            return {
                canChat: false,
                message: `Limit harian tercapai (${user.chatLimit} chat)`,
                usage: user.dailyUsage,
                limit: user.chatLimit
            };
        }

        return {
            canChat: true,
            usage: user.dailyUsage,
            limit: user.chatLimit,
            remaining: user.chatLimit - user.dailyUsage
        };
    }

    // Update user limit (admin function)
    async updateUserLimit(username, newLimit) {
        try {
            const user = this.users.get(username);
            if (!user) {
                return { success: false, message: 'User tidak ditemukan' };
            }

            user.chatLimit = newLimit;
            await this.saveUsers();

            return { success: true, message: `Limit diupdate ke ${newLimit}` };
        } catch (error) {
            console.error('❌ Update limit error:', error);
            return { success: false, message: 'Gagal update limit' };
        }
    }

    // Get all users (admin function)
    getAllUsers() {
        return Array.from(this.users.values()).map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
}

// Create singleton instance
const userModel = new UserModel();

module.exports = userModel;

