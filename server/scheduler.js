const cron = require('node-cron');
const { query } = require('./db');
const { generateGameResult, settleBets } = require('./utils/gameLogic');
const config = require('./config');

// Store current game state
let currentGame = {
    roundId: null,
    startTime: null,
    endTime: null,
    status: 'idle' // idle, active, closed
};

// Initialize game scheduler
function startGameScheduler() {
    console.log('🎮 Starting game scheduler...');
    
    // Run every minute to create new game rounds
    cron.schedule('* * * * *', async () => {
        try {
            await createNewGameRound();
        } catch (error) {
            console.error('Error in game scheduler:', error);
        }
    });
    
    // Run every second to update game timers and process bets
    setInterval(async () => {
        try {
            await updateGameStatus();
        } catch (error) {
            console.error('Error updating game status:', error);
        }
    }, 1000);
    
    console.log('✅ Game scheduler started');
}

// Create new game round
async function createNewGameRound() {
    const now = new Date();
    const roundId = `WINGO_${now.getTime()}`;
    
    try {
        // Check if there's already an active round
        const activeRounds = await query(
            'SELECT id FROM game_rounds WHERE status = ? AND end_time > datetime("now")',
            ['active']
        );
        
        if (activeRounds.length > 0) {
            return; // Round already exists
        }
        
        // Create new round
        const startTime = now;
        const endTime = new Date(startTime.getTime() + config.game.roundDuration);
        
        await query(
            `INSERT INTO game_rounds (round_id, start_time, end_time, status) VALUES (?, ?, ?, ?)`,
            [roundId, startTime, endTime, 'active']
        );
        
        currentGame = {
            roundId,
            startTime,
            endTime,
            status: 'active'
        };
        
        console.log(`🎲 New game round created: ${roundId}`);
        
    } catch (error) {
        console.error('Error creating game round:', error);
    }
}

// Update game status and process results
async function updateGameStatus() {
    try {
        const now = new Date();
        
        // Get current active round
        const activeRounds = await query(
            'SELECT * FROM game_rounds WHERE status = ? AND end_time <= ? ORDER BY end_time ASC LIMIT 1',
            ['active', now]
        );
        
        if (activeRounds.length > 0) {
            const round = activeRounds[0];
            
            // Generate result and settle bets
            await processGameRound(round);
            
            // Update round status
            await query(
                'UPDATE game_rounds SET status = ?, updated_at = datetime("now") WHERE id = ?',
                ['closed', round.id]
            );
            
            currentGame.status = 'idle';
            console.log(`✅ Game round ${round.round_id} processed and closed`);
        }
        
        // Check if betting window is closed (5 seconds before end)
        if (currentGame.status === 'active') {
            const timeLeft = currentGame.endTime - now;
            if (timeLeft <= 5000 && timeLeft > 0) {
                // Close betting 5 seconds before round ends
                await query(
                    'UPDATE game_rounds SET status = ? WHERE round_id = ?',
                    ['closed_betting', currentGame.roundId]
                );
            }
        }
        
    } catch (error) {
        console.error('Error updating game status:', error);
    }
}

// Process game round - generate result and settle bets
async function processGameRound(round) {
    try {
        // Generate random result
        const result = generateGameResult();
        
        // Store result
        await query(
            `INSERT INTO results (round_id, result_number, result_color, result_size, generated_at) VALUES (?, ?, ?, ?, ?)`,
            [round.round_id, result.number, result.color, result.size, new Date()]
        );
        
        console.log(`🎲 Game result for ${round.round_id}: ${result.number} (${result.color}, ${result.size})`);
        
        // Settle all bets for this round
        await settleBets(round.round_id, result);
        
    } catch (error) {
        console.error('Error processing game round:', error);
        throw error;
    }
}

// Get current game status
async function getCurrentGameStatus() {
    try {
        const rounds = await query(
            'SELECT * FROM game_rounds WHERE status = ? OR status = ? ORDER BY created_at DESC LIMIT 1',
            ['active', 'closed_betting']
        );
        
        if (rounds.length === 0) {
            return { status: 'no_round' };
        }
        
        const round = rounds[0];
        const now = new Date();
        const timeLeft = round.end_time - now;
        
        return {
            roundId: round.round_id,
            status: round.status,
            timeLeft: Math.max(0, timeLeft),
            startTime: round.start_time,
            endTime: round.end_time
        };
        
    } catch (error) {
        console.error('Error getting current game status:', error);
        return { status: 'error' };
    }
}

module.exports = {
    startGameScheduler,
    getCurrentGameStatus,
    currentGame
};