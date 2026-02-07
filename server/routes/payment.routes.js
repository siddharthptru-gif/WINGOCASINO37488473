<<<<<<< HEAD
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

=======
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

>>>>>>> ff6db2916f42106ebdfa88d8e8ce71566ff30a08
module.exports = router;