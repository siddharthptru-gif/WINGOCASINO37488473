const { query } = require('../db');
const { getCurrentGameStatus } = require('../scheduler');

// Get current game status
async function getCurrentGame(req, res) {
    try {
        const gameStatus = await getCurrentGameStatus();
        res.json(gameStatus);
    } catch (error) {
        console.error('Get current game error:', error);
        res.status(500).json({ error: 'Failed to fetch game status' });
    }
}

// Get game history
async function getGameHistory(req, res) {
    try {
        const { limit = 20 } = req.query;

        const history = await query(
            `SELECT r.round_id, res.result_number, res.result_color, res.result_size, res.generated_at
             FROM game_rounds r
             JOIN results res ON r.round_id = res.round_id
             WHERE r.status = 'closed'
             ORDER BY res.generated_at DESC
             LIMIT ?`,
            [parseInt(limit)]
        );

        res.json({
            history: history
        });

    } catch (error) {
        console.error('Get game history error:', error);
        res.status(500).json({ error: 'Failed to fetch game history' });
    }
}

module.exports = {
    getCurrentGame,
    getGameHistory
};