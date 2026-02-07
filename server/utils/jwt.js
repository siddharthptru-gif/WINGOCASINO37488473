const jwt = require('jsonwebtoken');
const config = require('../config');

// Generate access token
function generateAccessToken(user) {
    return jwt.sign(
        { userId: user.id, username: user.username },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
}

// Generate refresh token
function generateRefreshToken(user) {
    return jwt.sign(
        { userId: user.id, username: user.username },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
    );
}

// Generate admin token
function generateAdminToken(admin) {
    return jwt.sign(
        { adminId: admin.id, username: admin.username, role: admin.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
}

// Verify token
function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        throw error;
    }
}

// Verify refresh token
function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateAdminToken,
    verifyToken,
    verifyRefreshToken
};