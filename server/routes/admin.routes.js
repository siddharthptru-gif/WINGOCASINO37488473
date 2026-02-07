const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllUsers, 
    updateUserBalance, 
    getGameControl, 
    forceGameResult,
    getAllBets 
} = require('../controllers/admin.controller');

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get all users
router.get('/users', getAllUsers);

// Update user balance
router.put('/users/:userId/balance', updateUserBalance);

// Get game control panel
router.get('/game-control', getGameControl);

// Force game result
router.post('/force-result', forceGameResult);

// Get all bets
router.get('/bets', getAllBets);

module.exports = router;