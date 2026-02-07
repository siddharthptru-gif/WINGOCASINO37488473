const { query, transaction } = require('../db');

// Get wallet balance
async function getBalance(req, res) {
    try {
        const userId = req.user.id;

        const wallets = await query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [userId]
        );

        if (wallets.length === 0) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json({
            balance: wallets[0].balance
        });

    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
}

// Deposit money
async function deposit(req, res) {
    try {
        const userId = req.user.id;
        const { amount, payment_method, transaction_id } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount required' });
        }

        if (!payment_method) {
            return res.status(400).json({ error: 'Payment method required' });
        }

        // In real implementation, verify payment with payment gateway here
        // For now, we'll assume payment is successful

        // Update wallet balance and log transaction
        const queries = [
            {
                sql: 'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
                params: [amount, userId]
            },
            {
                sql: `INSERT INTO transactions (user_id, type, amount, payment_method, transaction_id, status) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                params: [userId, 'deposit', amount, payment_method, transaction_id || null, 'completed']
            }
        ];

        await transaction(queries);

        // Get updated balance
        const wallets = await query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [userId]
        );

        res.json({
            message: 'Deposit successful',
            amount: amount,
            new_balance: wallets[0].balance
        });

    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ error: 'Deposit failed' });
    }
}

// Withdraw money
async function withdraw(req, res) {
    try {
        const userId = req.user.id;
        const { amount, bank_details } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount required' });
        }

        if (!bank_details) {
            return res.status(400).json({ error: 'Bank details required' });
        }

        // Check balance
        const wallets = await query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [userId]
        );

        if (wallets.length === 0) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const currentBalance = wallets[0].balance;

        if (currentBalance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Update wallet balance and log transaction
        const queries = [
            {
                sql: 'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
                params: [amount, userId]
            },
            {
                sql: `INSERT INTO transactions (user_id, type, amount, bank_details, status) 
                      VALUES (?, ?, ?, ?, ?)`,
                params: [userId, 'withdrawal', amount, bank_details, 'pending']
            }
        ];

        await transaction(queries);

        // Get updated balance
        const updatedWallets = await query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [userId]
        );

        res.json({
            message: 'Withdrawal request submitted',
            amount: amount,
            new_balance: updatedWallets[0].balance,
            status: 'pending'
        });

    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({ error: 'Withdrawal failed' });
    }
}

// Get transaction history
async function getTransactions(req, res) {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;

        const transactions = await query(
            `SELECT id, type, amount, payment_method, bank_details, transaction_id, status, created_at
             FROM transactions 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), parseInt(offset)]
        );

        const total = await query(
            'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?',
            [userId]
        );

        res.json({
            transactions: transactions,
            pagination: {
                total: total[0].count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
}

module.exports = {
    getBalance,
    deposit,
    withdraw,
    getTransactions
};