const bcrypt = require('bcrypt');
const config = require('../config');

// Hash password
async function hashPassword(password) {
    try {
        const saltRounds = config.security.bcryptRounds;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error('Password hashing failed');
    }
}

// Compare password
async function comparePassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
}

module.exports = {
    hashPassword,
    comparePassword
};