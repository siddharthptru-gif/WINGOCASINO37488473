const jwt = require('jsonwebtoken');
const { query } = require('../db');
const config = require('../config');

// Authenticate JWT token
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Check if user exists and is active
        const users = await query(
            'SELECT id, username, email, status FROM users WHERE id = ? AND status = ?',
            [decoded.userId, 'active']
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
}

// Optional authentication (for routes that can be accessed by both authenticated and unauthenticated users)
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, config.jwt.secret);
            const users = await query(
                'SELECT id, username, email, status FROM users WHERE id = ? AND status = ?',
                [decoded.userId, 'active']
            );

            if (users.length > 0) {
                req.user = users[0];
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
}

module.exports = {
    authenticateToken,
    optionalAuth
};