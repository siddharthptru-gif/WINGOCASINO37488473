const { query, transaction } = require('../db');

// Create deposit request
async function createDepositRequest(req, res) {
    try {
        const { amount, upi_id, screenshot } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!amount || !upi_id) {
            return res.status(400).json({ error: 'Amount and UPI ID are required' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        // Create deposit request
        const result = await query(
            `INSERT INTO deposit_requests (user_id, amount, upi_id, screenshot, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, amount, upi_id, screenshot || null, 'pending', new Date()]
        );

        res.status(201).json({
            message: 'Deposit request created successfully',
            request_id: result.lastID,
            status: 'pending'
        });

    } catch (error) {
        console.error('Create deposit request error:', error);
        res.status(500).json({ error: 'Failed to create deposit request' });
    }
}

// Get user deposit history
async function getUserDepositHistory(req, res) {
    try {
        const userId = req.user.id;

        const deposits = await query(
            `SELECT dr.*, w.balance 
             FROM deposit_requests dr
             LEFT JOIN wallets w ON dr.user_id = w.user_id
             WHERE dr.user_id = ?
             ORDER BY dr.created_at DESC`,
            [userId]
        );

        res.json({ deposits });

    } catch (error) {
        console.error('Get deposit history error:', error);
        res.status(500).json({ error: 'Failed to fetch deposit history' });
    }
}

// Create withdrawal request
async function createWithdrawalRequest(req, res) {
    try {
        const { amount, upi_id, screenshot } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!amount || !upi_id) {
            return res.status(400).json({ error: 'Amount and UPI ID are required' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        // Check user balance
        const wallets = await query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [userId]
        );

        if (wallets.length === 0 || wallets[0].balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Create withdrawal request
        const result = await query(
            `INSERT INTO withdrawal_requests (user_id, amount, upi_id, screenshot, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, amount, upi_id, screenshot || null, 'pending', new Date()]
        );

        res.status(201).json({
            message: 'Withdrawal request created successfully',
            request_id: result.lastID,
            status: 'pending'
        });

    } catch (error) {
        console.error('Create withdrawal request error:', error);
        res.status(500).json({ error: 'Failed to create withdrawal request' });
    }
}

// Get user withdrawal history
async function getUserWithdrawalHistory(req, res) {
    try {
        const userId = req.user.id;

        const withdrawals = await query(
            `SELECT wr.*, w.balance 
             FROM withdrawal_requests wr
             LEFT JOIN wallets w ON wr.user_id = w.user_id
             WHERE wr.user_id = ?
             ORDER BY wr.created_at DESC`,
            [userId]
        );

        res.json({ withdrawals });

    } catch (error) {
        console.error('Get withdrawal history error:', error);
        res.status(500).json({ error: 'Failed to fetch withdrawal history' });
    }
}

// Admin: Get all deposit requests
async function getAllDepositRequests(req, res) {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let whereClause = '';
        let params = [];

        if (status) {
            whereClause = 'WHERE status = ?';
            params.push(status);
        }

        params.push(parseInt(limit));
        params.push(parseInt(offset));

        const requests = await query(
            `SELECT dr.*, u.username, u.email 
             FROM deposit_requests dr
             JOIN users u ON dr.user_id = u.id
             ${whereClause}
             ORDER BY dr.created_at DESC
             LIMIT ? OFFSET ?`,
            params
        );

        const total = await query(
            `SELECT COUNT(*) as count FROM deposit_requests dr JOIN users u ON dr.user_id = u.id ${whereClause}`,
            status ? [status] : []
        );

        res.json({
            requests,
            pagination: {
                total: total[0].count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Get all deposit requests error:', error);
        res.status(500).json({ error: 'Failed to fetch deposit requests' });
    }
}

// Admin: Get all withdrawal requests
async function getAllWithdrawalRequests(req, res) {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let whereClause = '';
        let params = [];

        if (status) {
            whereClause = 'WHERE status = ?';
            params.push(status);
        }

        params.push(parseInt(limit));
        params.push(parseInt(offset));

        const requests = await query(
            `SELECT wr.*, u.username, u.email 
             FROM withdrawal_requests wr
             JOIN users u ON wr.user_id = u.id
             ${whereClause}
             ORDER BY wr.created_at DESC
             LIMIT ? OFFSET ?`,
            params
        );

        const total = await query(
            `SELECT COUNT(*) as count FROM withdrawal_requests wr JOIN users u ON wr.user_id = u.id ${whereClause}`,
            status ? [status] : []
        );

        res.json({
            requests,
            pagination: {
                total: total[0].count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Get all withdrawal requests error:', error);
        res.status(500).json({ error: 'Failed to fetch withdrawal requests' });
    }
}

// Admin: Process deposit request
async function processDepositRequest(req, res) {
    try {
        const { requestId } = req.params;
        const { status, admin_note } = req.body;
        const adminId = req.admin.id; // From admin middleware

        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Get the deposit request
        const requests = await query(
            'SELECT * FROM deposit_requests WHERE id = ?',
            [requestId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Deposit request not found' });
        }

        const depositRequest = requests[0];

        if (depositRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Request is not in pending status' });
        }

        // Update request status
        await query(
            'UPDATE deposit_requests SET status = ?, processed_at = ?, admin_note = ? WHERE id = ?',
            [status, new Date(), admin_note || null, requestId]
        );

        if (status === 'approved') {
            // Get current balance
            const currentWallet = await query('SELECT balance FROM wallets WHERE user_id = ?', [depositRequest.user_id]);
            const currentBalance = currentWallet[0]?.balance || 0;
            const newBalance = currentBalance + depositRequest.amount;
            
            // Add funds to user wallet
            const queries = [
                {
                    sql: 'UPDATE wallets SET balance = ? WHERE user_id = ?',
                    params: [newBalance, depositRequest.user_id]
                },
                {
                    sql: `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description) 
                          VALUES (?, ?, ?, ?, ?, ?)`,
                    params: [
                        depositRequest.user_id, 
                        'deposit', 
                        depositRequest.amount, 
                        currentBalance,
                        newBalance,
                        `Deposit approved: ${admin_note || 'Admin approval'}`
                    ]
                }
            ];

            await transaction(queries);
        }

        res.json({ message: `Deposit request ${status} successfully` });

    } catch (error) {
        console.error('Process deposit request error:', error);
        res.status(500).json({ error: 'Failed to process deposit request' });
    }
}

// Admin: Process withdrawal request
async function processWithdrawalRequest(req, res) {
    try {
        const { requestId } = req.params;
        const { status, admin_note } = req.body;
        const adminId = req.admin.id; // From admin middleware

        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Get the withdrawal request
        const requests = await query(
            'SELECT * FROM withdrawal_requests WHERE id = ?',
            [requestId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Withdrawal request not found' });
        }

        const withdrawalRequest = requests[0];

        if (withdrawalRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Request is not in pending status' });
        }

        // Update request status
        await query(
            'UPDATE withdrawal_requests SET status = ?, processed_at = ?, admin_note = ? WHERE id = ?',
            [status, new Date(), admin_note || null, requestId]
        );

        if (status === 'approved') {
            // Get current balance
            const currentWallet = await query('SELECT balance FROM wallets WHERE user_id = ?', [withdrawalRequest.user_id]);
            const currentBalance = currentWallet[0]?.balance || 0;
            const newBalance = currentBalance - withdrawalRequest.amount;
            
            // Deduct funds from user wallet
            const queries = [
                {
                    sql: 'UPDATE wallets SET balance = ? WHERE user_id = ?',
                    params: [newBalance, withdrawalRequest.user_id]
                },
                {
                    sql: `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description) 
                          VALUES (?, ?, ?, ?, ?, ?)`,
                    params: [
                        withdrawalRequest.user_id, 
                        'withdrawal', 
                        withdrawalRequest.amount, 
                        currentBalance,
                        newBalance,
                        `Withdrawal approved: ${admin_note || 'Admin approval'}`
                    ]
                }
            ];

            await transaction(queries);
        }

        res.json({ message: `Withdrawal request ${status} successfully` });

    } catch (error) {
        console.error('Process withdrawal request error:', error);
        res.status(500).json({ error: 'Failed to process withdrawal request' });
    }
}

module.exports = {
    createDepositRequest,
    getUserDepositHistory,
    createWithdrawalRequest,
    getUserWithdrawalHistory,
    getAllDepositRequests,
    getAllWithdrawalRequests,
    processDepositRequest,
    processWithdrawalRequest
};