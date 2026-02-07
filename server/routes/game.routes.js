const express = require('express');
const router = express.Router();
const { getCurrentGame, getGameHistory } = require('../controllers/game.controller');

// Get current game status
router.get('/status', getCurrentGame);

// Get game history
router.get('/history', getGameHistory);

module.exports = router;