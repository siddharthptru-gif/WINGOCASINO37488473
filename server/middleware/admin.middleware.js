const jwt = require('jsonwebtoken');
const { query } = require('../db');
const config = require('../config');

// Authenticate admin JWT token
async function authenticateAdmin(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Admin access token required' });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Check if admin exists and is active
        const admins = await query(
            'SELECT id, username, email, role, status FROM admins WHERE id = ? AND status = ?',
            [decoded.adminId, 'active']
        );

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Invalid or inactive admin' });
        }

        req.admin = admins[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Admin token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid admin token' });
        }
        return res.status(500).json({ error: 'Admin authentication failed' });
    }
}

module.exports = {
    authenticateAdmin
};