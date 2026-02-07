const express = require('express');
const router = express.Router();
const { 
    adminLogin,
    getDashboardStats, 
    getAllUsers, 
    updateUserBalance, 
    getGameControl, 
    forceGameResult,
    getAllBets,
    getAllTransactions,
    getReports,
    banUser
} = require('../controllers/admin.controller');

// Admin login
router.post('/login', adminLogin);

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

// Get all transactions
router.get('/transactions', getAllTransactions);

// Get reports
router.get('/reports', getReports);

// Ban user
router.put('/users/:userId/ban', banUser);

module.exports = router;