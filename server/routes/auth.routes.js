const express = require('express');
const router = express.Router();
const { register, login, refreshToken } = require('../controllers/auth.controller');

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Refresh token
router.post('/refresh', refreshToken);

module.exports = router;