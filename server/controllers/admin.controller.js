const { query, transaction } = require('../db');
const { generateGameResult } = require('../utils/gameLogic');
const { comparePassword } = require('../utils/hash');
const { generateAdminToken } = require('../utils/jwt');

// Admin login
async function adminLogin(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find admin
        const admins = await query(
            'SELECT id, username, email, password, role, status FROM admins WHERE username = ?',
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = admins[0];

        if (admin.status !== 'active') {
            return res.status(401).json({ error: 'Account is inactive' });
        }

        // For demo purposes, check if it's the default admin
        // In production, you should properly hash and compare passwords
        if (username === 'admin' && password === 'admin123') {
            const adminResponse = {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            };

            const token = generateAdminToken(adminResponse);

            res.json({
                message: 'Admin login successful',
                admin: adminResponse,
                token: token
            });
        } else {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}

// Get dashboard statistics
async function getDashboardStats(req, res) {
    try {
        // Get total users
        const userStats = await query(
            `SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
                SUM(w.balance) as total_balance
             FROM users u
             JOIN wallets w ON u.id = w.user_id`
        );

        // Get today's betting stats (SQLite compatible)
        const todayStats = await query(
            `SELECT 
                COUNT(*) as total_bets,
                SUM(amount) as total_bet_amount,
                SUM(CASE WHEN status = 'won' THEN payout ELSE 0 END) as total_payout
             FROM bets 
             WHERE date(created_at) = date('now')`
        );

        // Get recent users with mobile information
        const recentUsers = await query(
            `SELECT u.id, u.username, u.mobile, w.balance, u.created_at
             FROM users u
             JOIN wallets w ON u.id = w.user_id
             ORDER BY u.created_at DESC
             LIMIT 10`
        );

        res.json({
            stats: {
                users: userStats[0],
                today: todayStats[0],
                recent_users: recentUsers
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
}

// Get all users with mobile information
async function getAllUsers(req, res) {
    try {
        const { limit = 50, offset = 0, search = '' } = req.query;

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE u.username LIKE ? OR u.mobile LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        params.push(parseInt(limit));
        params.push(parseInt(offset));

        const users = await query(
            `SELECT u.id, u.username, u.mobile, u.phone, u.status, u.created_at, u.last_login,
                    w.balance
             FROM users u
             JOIN wallets w ON u.id = w.user_id
             ${whereClause}
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            params
        );

        const total = await query(
            `SELECT COUNT(*) as count FROM users u ${whereClause ? whereClause.replace('?', 'u.username LIKE ? OR u.mobile LIKE ?') : ''}`,
            search ? [`%${search}%`, `%${search}%`] : []
        );

        res.json({
            users: users,
            pagination: {
                total: total[0].count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

// Update user balance
async function updateUserBalance(req, res) {
    try {
        const { userId } = req.params;
        const { amount, action, reason } = req.body;

        if (!amount || !action) {
            return res.status(400).json({ error: 'Amount and action required' });
        }

        const validActions = ['add', 'subtract'];
        if (!validActions.includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        // Get current balance
        const wallets = await query(
            'SELECT balance FROM wallets WHERE user_id = ?',
            [userId]
        );

        if (wallets.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentBalance = wallets[0].balance;
        const amountValue = parseFloat(amount);

        // Calculate new balance
        let newBalance;
        if (action === 'add') {
            newBalance = currentBalance + amountValue;
        } else {
            if (currentBalance < amountValue) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }
            newBalance = currentBalance - amountValue;
        }

        // Update balance and log transaction
        const queries = [
            {
                sql: 'UPDATE wallets SET balance = ? WHERE user_id = ?',
                params: [newBalance, userId]
            },
            {
                sql: `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                params: [userId, action === 'add' ? 'admin_credit' : 'admin_debit', amountValue, currentBalance, newBalance, reason || 'Admin adjustment']
            }
        ];

        await transaction(queries);

        res.json({
            message: `Balance ${action}ed successfully`,
            user_id: userId,
            amount: amountValue,
            old_balance: currentBalance,
            new_balance: newBalance
        });

    } catch (error) {
        console.error('Update user balance error:', error);
        res.status(500).json({ error: 'Failed to update balance' });
    }
}

// Get game control panel
async function getGameControl(req, res) {
    try {
        // Get all active games
        const activeGames = await query(
            `SELECT DISTINCT bet_type as game_type
             FROM bets 
             WHERE status = 'pending'
             ORDER BY bet_type`
        );

        // Get current active rounds for all games
        const activeRounds = await query(
            `SELECT round_id, start_time, end_time, status 
             FROM game_rounds 
             WHERE status IN ('active', 'closed_betting') 
             ORDER BY created_at DESC`
        );

        // Get current bets analysis for all games
        const betAnalysis = await query(
            `SELECT bet_type, bet_option, COUNT(*) as count, SUM(amount) as total_amount
             FROM bets 
             WHERE status = 'pending'
             GROUP BY bet_type, bet_option
             ORDER BY bet_type, bet_option`
        );

        // Organize analysis by game type
        const analysis = {};
        betAnalysis.forEach(bet => {
            if (!analysis[bet.bet_type]) analysis[bet.bet_type] = {};
            analysis[bet.bet_type][bet.bet_option] = {
                count: bet.count,
                amount: bet.total_amount
            };
        });

        // Get available games
        const availableGames = [
            { id: 'wingo_1min', name: 'Wingo 1 Minute', min_bet: 10, max_bet: 10000 },
            { id: 'wingo_3min', name: 'Wingo 3 Minutes', min_bet: 10, max_bet: 10000 },
            { id: 'wingo_5min', name: 'Wingo 5 Minutes', min_bet: 10, max_bet: 10000 },
            { id: 'dragon_tiger', name: 'Dragon Tiger', min_bet: 50, max_bet: 50000 },
            { id: 'roulette', name: 'Roulette', min_bet: 20, max_bet: 20000 }
        ];

        res.json({
            active_games: activeGames,
            current_rounds: activeRounds,
            bet_analysis: analysis,
            available_games: availableGames
        });

    } catch (error) {
        console.error('Get game control error:', error);
        res.status(500).json({ error: 'Failed to fetch game control data' });
    }
}

// Force game result
async function forceGameResult(req, res) {
    try {
        const { result_number, game_type, round_id } = req.body;

        if (result_number === undefined || result_number < 0 || result_number > 9) {
            return res.status(400).json({ error: 'Valid result number (0-9) required' });
        }

        // Get specific round or current active round
        let round;
        if (round_id) {
            const rounds = await query(
                'SELECT id, round_id FROM game_rounds WHERE round_id = ? AND status = ?',
                [round_id, 'active']
            );
            round = rounds[0];
        } else {
            const activeRounds = await query(
                'SELECT id, round_id FROM game_rounds WHERE status = ? ORDER BY end_time ASC LIMIT 1',
                ['active']
            );
            round = activeRounds[0];
        }

        if (!round) {
            return res.status(400).json({ error: 'No active game round found' });
        }

        // Generate result based on forced number
        const result = generateGameResult(result_number);

        // Store result and settle bets
        const queries = [
            {
                sql: `INSERT INTO results (round_id, result_number, result_color, result_size, generated_at) 
                      VALUES (?, ?, ?, ?, ?)`,
                params: [round.round_id, result.number, result.color, result.size, new Date()]
            },
            {
                sql: 'UPDATE game_rounds SET status = ? WHERE id = ?',
                params: ['closed', round.id]
            }
        ];

        await transaction(queries);

        res.json({
            message: 'Game result forced successfully',
            game_type: game_type || 'wingo',
            round_id: round.round_id,
            result: result
        });

    } catch (error) {
        console.error('Force game result error:', error);
        res.status(500).json({ error: 'Failed to force game result' });
    }
}

// Get all bets
async function getAllBets(req, res) {
    try {
        const { limit = 100, offset = 0, round_id } = req.query;

        let whereClause = '';
        let params = [];

        if (round_id) {
            whereClause = 'WHERE b.round_id = ?';
            params.push(round_id);
        }

        params.push(parseInt(limit));
        params.push(parseInt(offset));

        const bets = await query(
            `SELECT b.id, u.username, b.round_id, b.bet_type, b.bet_option, b.amount, b.payout, 
                    b.status, b.created_at, r.result_number, r.result_color, r.result_size
             FROM bets b
             JOIN users u ON b.user_id = u.id
             LEFT JOIN results r ON b.round_id = r.round_id
             ${whereClause}
             ORDER BY b.created_at DESC
             LIMIT ? OFFSET ?`,
            params
        );

        const total = await query(
            `SELECT COUNT(*) as count FROM bets b ${whereClause}`,
            round_id ? [round_id] : []
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
        console.error('Get all bets error:', error);
        res.status(500).json({ error: 'Failed to fetch bets' });
    }
}

// Get all transactions
async function getAllTransactions(req, res) {
    try {
        const { limit = 100, offset = 0, user_id, type } = req.query;

        let whereClause = '';
        let params = [];

        if (user_id) {
            whereClause += whereClause ? ' AND t.user_id = ?' : 'WHERE t.user_id = ?';
            params.push(user_id);
        }
        
        if (type) {
            whereClause += whereClause ? ' AND t.type = ?' : 'WHERE t.type = ?';
            params.push(type);
        }

        params.push(parseInt(limit));
        params.push(parseInt(offset));

        const transactions = await query(
            `SELECT t.id, u.username, t.type, t.amount, t.balance_before, t.balance_after, 
                    t.description, t.status, t.created_at
             FROM transactions t
             JOIN users u ON t.user_id = u.id
             ${whereClause}
             ORDER BY t.created_at DESC
             LIMIT ? OFFSET ?`,
            params
        );

        const total = await query(
            `SELECT COUNT(*) as count FROM transactions t ${whereClause}`,
            user_id || type ? params.slice(0, -2) : []
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
        console.error('Get all transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
}

// Get reports data
async function getReports(req, res) {
    try {
        // Get daily statistics (SQLite compatible)
        const dailyStats = await query(
            `SELECT date(created_at) as date, 
                    COUNT(*) as total_bets,
                    SUM(amount) as total_bet_amount,
                    SUM(CASE WHEN status = 'won' THEN payout ELSE 0 END) as total_payout,
                    SUM(CASE WHEN status = 'won' THEN payout - amount ELSE -amount END) as house_profit
             FROM bets 
             WHERE created_at >= datetime('now', '-30 days')
             GROUP BY date(created_at)
             ORDER BY date DESC`
        );

        // Get user statistics
        const userStats = await query(
            `SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
                AVG(w.balance) as avg_balance,
                SUM(w.balance) as total_balance
             FROM users u
             JOIN wallets w ON u.id = w.user_id`
        );

        // Get popular betting patterns (SQLite compatible)
        const bettingPatterns = await query(
            `SELECT bet_type, bet_option, 
                    COUNT(*) as bet_count,
                    SUM(amount) as total_amount,
                    AVG(amount) as avg_bet
             FROM bets
             WHERE created_at >= datetime('now', '-7 days')
             GROUP BY bet_type, bet_option
             ORDER BY bet_count DESC
             LIMIT 10`
        );

        res.json({
            daily_stats: dailyStats,
            user_stats: userStats[0],
            popular_bets: bettingPatterns
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
}

// Ban user
async function banUser(req, res) {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        await query(
            'UPDATE users SET status = ? WHERE id = ?',
            ['banned', userId]
        );

        // Log the action
        await query(
            `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, 'admin_debit', 0, 0, 0, `User banned: ${reason || 'No reason provided'}`]
        );

        res.json({ message: 'User banned successfully' });

    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
}

module.exports = {
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
};