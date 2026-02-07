const { query, transaction } = require('../db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, generateAdminToken } = require('../utils/jwt');
const config = require('../config');

// User registration
async function register(req, res) {
    try {
        console.log('Registration request received:', req.body);
        const { username, email, password, phone } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUsers = await query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user first
        const userResult = await query(
            'INSERT INTO users (username, email, phone, password_hash) VALUES (?, ?, ?, ?)',
            [username, email, phone || null, hashedPassword]
        );
        
        const userId = userResult.insertId;
        
        // Create wallet for the user
        await query(
            'INSERT INTO wallets (user_id, balance) VALUES (?, ?)',
            [userId, 0] // Start with 0 balance for real money platform
        );

        // Create user object from registration data
        const user = {
            id: userId,
            username: username,
            email: email,
            phone: phone || null
        };
        
        console.log('User object created:', user);
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at
            },
            tokens: {
                access_token: accessToken,
                refresh_token: refreshToken
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
}

// User login
async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const users = await query(
            'SELECT id, username, email, phone, password_hash, status FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        if (user.status !== 'active') {
            return res.status(401).json({ error: 'Account is inactive' });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Get user without password
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone
        };

        const accessToken = generateAccessToken(userResponse);
        const refreshToken = generateRefreshToken(userResponse);

        res.json({
            message: 'Login successful',
            user: userResponse,
            tokens: {
                access_token: accessToken,
                refresh_token: refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}

// Refresh token
async function refreshToken(req, res) {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const decoded = require('../utils/jwt').verifyRefreshToken(refresh_token);
        
        const users = await query(
            'SELECT id, username, email, phone FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const user = users[0];
        const newAccessToken = generateAccessToken(user);

        res.json({
            tokens: {
                access_token: newAccessToken
            }
        });

    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
}

module.exports = {
    register,
    login,
    refreshToken
};