const { query, transaction } = require('../db');
const { getCurrentGameStatus } = require('../scheduler');
const config = require('../config');

// Place a bet
async function placeBet(req, res) {
    try {
        const userId = req.user.id;
        const { bet_type, bet_option, amount } = req.body;

        // Validate input
        if (!bet_type || !bet_option || !amount) {
            return res.status(400).json({ error: 'Bet type, option, and amount required' });
        }

        if (amount < config.game.minBet || amount > config.game.maxBet) {
            return res.status(400).json({ 
                error: `Bet amount must be between ${config.game.minBet} and ${config.game.maxBet}` 
            });
        }

        // Get current game status
        const gameStatus = await getCurrentGameStatus();

        if (gameStatus.status !== 'active' && gameStatus.status !== 'closed_betting') {
            return res.status(400).json({ error: 'No active game round' });
        }

        if (gameStatus.status === 'closed_betting') {
            return res.status(400).json({ error: 'Betting is closed for this round' });
        }

        // Check if betting window is still open
        if (gameStatus.timeLeft <= 5000) {
            return res.status(400).json({ error: 'Betting window closed' });
        }

        // Check user balance
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

        // Check if user already placed bet on same option
        const existingBets = await query(
            `SELECT id FROM bets 
             WHERE user_id = ? AND round_id = ? AND bet_type = ? AND bet_option = ?`,
            [userId, gameStatus.roundId, bet_type, bet_option]
        );

        if (existingBets.length > 0) {
            return res.status(400).json({ error: 'You have already placed a bet on this option' });
        }

        // Place bet - deduct balance and create bet record
        const queries = [
            {
                sql: 'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
                params: [amount, userId]
            },
            {
                sql: `INSERT INTO bets (user_id, round_id, bet_type, bet_option, amount, status) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                params: [userId, gameStatus.roundId, bet_type, bet_option, amount, 'pending']
            },
            {
                sql: `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after) 
                      VALUES (?, ?, ?, ?, ?)`,
                params: [userId, 'bet', amount, currentBalance, currentBalance - amount]
            }
        ];

        await transaction(queries);

        res.json({
            message: 'Bet placed successfully',
            bet: {
                round_id: gameStatus.roundId,
                bet_type: bet_type,
                bet_option: bet_option,
                amount: amount,
                time_left: gameStatus.timeLeft
            }
        });

    } catch (error) {
        console.error('Place bet error:', error);
        res.status(500).json({ error: 'Failed to place bet' });
    }
}

// Get user's bet history
async function getUserBets(req, res) {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;

        const bets = await query(
            `SELECT b.id, b.round_id, b.bet_type, b.bet_option, b.amount, b.payout, b.status, 
                    b.created_at, r.result_number, r.result_color, r.result_size
             FROM bets b
             LEFT JOIN results r ON b.round_id = r.round_id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), parseInt(offset)]
        );

        const total = await query(
            'SELECT COUNT(*) as count FROM bets WHERE user_id = ?',
            [userId]
        );

        res.json({
            bets: bets,
            pagination: {
                total: total[0].count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Get user bets error:', error);
        res.status(500).json({ error: 'Failed to fetch bet history' });
    }
}

module.exports = {
    placeBet,
    getUserBets
};