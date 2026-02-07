const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SqliteDatabase {
    constructor() {
        // Use persistent database file
        this.db = new sqlite3.Database(path.join(__dirname, '../database/casino.db'));
        this.init();
    }

    init() {
        // Create tables if they don't exist
        this.db.serialize(() => {
            // Users table - Modified to use mobile instead of email
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    mobile TEXT UNIQUE NOT NULL,
                    phone TEXT,
                    password_hash TEXT NOT NULL,
                    status TEXT DEFAULT 'active',
                    kyc_status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME
                )
            `);

            // Wallets table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS wallets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER UNIQUE,
                    balance REAL DEFAULT 0.00,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `);

            // Transactions table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    balance_before REAL NOT NULL,
                    balance_after REAL NOT NULL,
                    payment_method TEXT,
                    transaction_id TEXT,
                    bank_details TEXT,
                    description TEXT,
                    status TEXT DEFAULT 'completed',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `);

            // Deposit Requests table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS deposit_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    amount REAL NOT NULL,
                    upi_id TEXT,
                    screenshot TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    processed_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `);

            // Withdrawal Requests table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS withdrawal_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    amount REAL NOT NULL,
                    upi_id TEXT,
                    screenshot TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    processed_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `);

            // Game Rounds table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS game_rounds (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    round_id TEXT UNIQUE NOT NULL,
                    start_time DATETIME NOT NULL,
                    end_time DATETIME NOT NULL,
                    status TEXT DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Bets table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS bets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    round_id TEXT,
                    bet_type TEXT NOT NULL,
                    bet_option TEXT NOT NULL,
                    amount REAL NOT NULL,
                    payout REAL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                    FOREIGN KEY (round_id) REFERENCES game_rounds (round_id) ON DELETE CASCADE
                )
            `);

            // Results table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    round_id TEXT UNIQUE,
                    result_number INTEGER NOT NULL,
                    result_color TEXT NOT NULL,
                    result_size TEXT NOT NULL,
                    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (round_id) REFERENCES game_rounds (round_id) ON DELETE CASCADE
                )
            `);

            // Admins table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT DEFAULT 'admin',
                    status TEXT DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME
                )
            `);

            // Insert default admin if not exists
            this.db.get("SELECT id FROM admins WHERE username = ?", ['admin'], (err, row) => {
                if (!row) {
                    const crypto = require('crypto');
                    const defaultPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');
                    this.db.run(
                        "INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)",
                        ['admin', 'admin@wingocasino.com', defaultPasswordHash, 'super_admin']
                    );
                }
            });
        });
    }

    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    async transaction(queries) {
        const results = [];
        
        // Begin transaction
        await this.run('BEGIN TRANSACTION');
        
        try {
            for (const queryObj of queries) {
                const result = await this.run(queryObj.sql, queryObj.params);
                results.push(result);
            }
            
            // Commit transaction
            await this.run('COMMIT');
            return results;
        } catch (error) {
            // Rollback transaction
            await this.run('ROLLBACK');
            throw error;
        }
    }

    async close() {
        return new Promise((resolve) => {
            this.db.close(resolve);
        });
    }
}

const db = new SqliteDatabase();
module.exports = db;