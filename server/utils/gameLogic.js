// Generate game result
function generateGameResult(forcedNumber = null) {
    // If forced number is provided, use it
    const number = forcedNumber !== null ? forcedNumber : Math.floor(Math.random() * 10);
    
    // Determine color based on number
    let color;
    if (number === 0 || number === 5) {
        color = 'violet';
    } else if ([2, 4, 6, 8].includes(number)) {
        color = 'red';
    } else {
        color = 'green';
    }
    
    // Determine size
    const size = number >= 5 ? 'big' : 'small';
    
    return {
        number: number,
        color: color,
        size: size
    };
}

// Settle bets based on game result
async function settleBets(roundId, result) {
    const { query, transaction } = require('../db');
    
    try {
        // Get all pending bets for this round
        const bets = await query(
            'SELECT id, user_id, bet_type, bet_option, amount FROM bets WHERE round_id = ? AND status = ?',
            [roundId, 'pending']
        );

        const winningBets = [];
        const losingBets = [];

        // Determine winners and losers
        for (const bet of bets) {
            let won = false;
            
            switch (bet.bet_type) {
                case 'big_small':
                    won = bet.bet_option === result.size;
                    break;
                case 'color':
                    won = bet.bet_option === result.color;
                    break;
                case 'number':
                    won = parseInt(bet.bet_option) === result.number;
                    break;
            }

            if (won) {
                winningBets.push(bet);
            } else {
                losingBets.push(bet);
            }
        }

        // Process winning bets
        if (winningBets.length > 0) {
            const winQueries = [];
            
            for (const bet of winningBets) {
                // Calculate payout
                let payoutMultiplier = 2; // Default 2x for most bets
                
                if (bet.bet_type === 'number') {
                    payoutMultiplier = 9; // 9x for exact number
                } else if (bet.bet_option === 'violet' && bet.bet_type === 'color') {
                    payoutMultiplier = 4.5; // 4.5x for violet
                }
                
                const payout = bet.amount * payoutMultiplier;
                
                // Get current balance for transaction log
                const wallets = await query(
                    'SELECT balance FROM wallets WHERE user_id = ?',
                    [bet.user_id]
                );
                
                const currentBalance = wallets[0].balance;
                const newBalance = currentBalance + payout;
                
                // Add queries for this winning bet
                winQueries.push({
                    sql: 'UPDATE bets SET status = ?, payout = ? WHERE id = ?',
                    params: ['won', payout, bet.id]
                });
                
                winQueries.push({
                    sql: 'UPDATE wallets SET balance = ? WHERE user_id = ?',
                    params: [newBalance, bet.user_id]
                });
                
                winQueries.push({
                    sql: `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after) 
                          VALUES (?, ?, ?, ?, ?)`,
                    params: [bet.user_id, 'win', payout, currentBalance, newBalance]
                });
            }
            
            // Execute all winning bet queries
            await transaction(winQueries);
        }

        // Process losing bets
        if (losingBets.length > 0) {
            const loseQueries = losingBets.map(bet => ({
                sql: 'UPDATE bets SET status = ? WHERE id = ?',
                params: ['lost', bet.id]
            }));
            
            await transaction(loseQueries);
        }

        console.log(`🎲 Settled ${winningBets.length} winning bets and ${losingBets.length} losing bets for round ${roundId}`);

    } catch (error) {
        console.error('Error settling bets:', error);
        throw error;
    }
}

module.exports = {
    generateGameResult,
    settleBets
};