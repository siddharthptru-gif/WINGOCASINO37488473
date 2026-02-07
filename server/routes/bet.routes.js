const express = require('express');
const router = express.Router();
const { placeBet, getUserBets } = require('../controllers/bet.controller');

// Place a bet
router.post('/place', placeBet);

// Get user's bet history
router.get('/history', getUserBets);

module.exports = router;