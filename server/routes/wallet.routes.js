const express = require('express');
const router = express.Router();
const { getBalance, deposit, withdraw, getTransactions } = require('../controllers/wallet.controller');

// Get wallet balance
router.get('/balance', getBalance);

// Deposit money
router.post('/deposit', deposit);

// Withdraw money
router.post('/withdraw', withdraw);

// Get transaction history
router.get('/transactions', getTransactions);

module.exports = router;