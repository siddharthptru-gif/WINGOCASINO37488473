const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

module.exports = router;