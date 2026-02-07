const express = require('express');
const router = express.Router();
const { 
    createDepositRequest,
    getUserDepositHistory,
    createWithdrawalRequest,
    getUserWithdrawalHistory,
    getAllDepositRequests,
    getAllWithdrawalRequests,
    processDepositRequest,
    processWithdrawalRequest
} = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authenticateAdmin } = require('../middleware/admin.middleware');

// User payment routes (require authentication)
router.post('/deposit', authenticateToken, createDepositRequest);
router.get('/deposits', authenticateToken, getUserDepositHistory);
router.post('/withdrawal', authenticateToken, createWithdrawalRequest);
router.get('/withdrawals', authenticateToken, getUserWithdrawalHistory);

// Admin payment routes (require admin authentication)
router.get('/admin/deposits', authenticateAdmin, getAllDepositRequests);
router.get('/admin/withdrawals', authenticateAdmin, getAllWithdrawalRequests);
router.put('/admin/deposits/:requestId/process', authenticateAdmin, processDepositRequest);
router.put('/admin/withdrawals/:requestId/process', authenticateAdmin, processWithdrawalRequest);

module.exports = router;