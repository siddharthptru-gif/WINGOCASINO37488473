<<<<<<< HEAD
const { Pool } = require('pg');
const path = require('path');

class PostgreSqlDatabase {
    constructor() {
        // Check if DATABASE_URL is provided
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
        }
        
        // Use Render's DATABASE_URL environment variable
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Render's PostgreSQL
            },
            max: 20, // max number of clients in the pool
            idleTimeoutMillis: 30000, // close idle clients after 30 seconds
            connectionTimeoutMillis: 5000, // return an error after 5 seconds if connection could not be established
        });
        
        this.init();
    }

    init() {
        // Create tables if they don't exist
        this.createTables();
    }

    async createTables() {
        try {
            // Users table
            await this.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    password_hash VARCHAR(255) NOT NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    kyc_status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            `);

            // Wallets table
            await this.query(`
                CREATE TABLE IF NOT EXISTS wallets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER UNIQUE REFERENCES users (id) ON DELETE CASCADE,
                    balance DECIMAL(15,2) DEFAULT 0.00,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Transactions table
            await this.query(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    type VARCHAR(20) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    balance_before DECIMAL(15,2) NOT NULL,
                    balance_after DECIMAL(15,2) NOT NULL,
                    payment_method VARCHAR(50),
                    transaction_id VARCHAR(100),
                    bank_details TEXT,
                    description TEXT,
                    status VARCHAR(20) DEFAULT 'completed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Deposit Requests table
            await this.query(`
                CREATE TABLE IF NOT EXISTS deposit_requests (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    amount DECIMAL(15,2) NOT NULL,
                    upi_id VARCHAR(100),
                    screenshot TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP
                )
            `);

            // Withdrawal Requests table
            await this.query(`
                CREATE TABLE IF NOT EXISTS withdrawal_requests (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    amount DECIMAL(15,2) NOT NULL,
                    upi_id VARCHAR(100),
                    screenshot TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP
                )
            `);

            // Game Rounds table
            await this.query(`
                CREATE TABLE IF NOT EXISTS game_rounds (
                    id SERIAL PRIMARY KEY,
                    round_id VARCHAR(50) UNIQUE NOT NULL,
                    start_time TIMESTAMP NOT NULL,
                    end_time TIMESTAMP NOT NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Bets table
            await this.query(`
                CREATE TABLE IF NOT EXISTS bets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    round_id VARCHAR(50) REFERENCES game_rounds (round_id) ON DELETE CASCADE,
                    bet_type VARCHAR(20) NOT NULL,
                    bet_option VARCHAR(20) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    payout DECIMAL(15,2),
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Results table
            await this.query(`
                CREATE TABLE IF NOT EXISTS results (
                    id SERIAL PRIMARY KEY,
                    round_id VARCHAR(50) UNIQUE REFERENCES game_rounds (round_id) ON DELETE CASCADE,
                    result_number INTEGER NOT NULL,
                    result_color VARCHAR(20) NOT NULL,
                    result_size VARCHAR(20) NOT NULL,
                    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Admins table
            await this.query(`
                CREATE TABLE IF NOT EXISTS admins (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            `);

            // Insert default admin if not exists
            const result = await this.query(
                "SELECT id FROM admins WHERE username = $1", 
                ['admin']
            );
            
            if (result.rows.length === 0) {
                const crypto = require('crypto');
                const defaultPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');
                await this.query(
                    "INSERT INTO admins (username, email, password, role) VALUES ($1, $2, $3, $4)",
                    ['admin', 'admin@wingocasino.com', defaultPasswordHash, 'super_admin']
                );
            }

            console.log('✅ PostgreSQL tables created successfully');
        } catch (error) {
            console.error('❌ Error creating PostgreSQL tables:', error);
        }
    }

    async query(text, params = []) {
        const start = Date.now();
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;
        console.log(' executing query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
        return res;
    }

    async transaction(queries) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            const results = [];
            for (const queryObj of queries) {
                const result = await client.query(queryObj.sql, queryObj.params);
                results.push(result);
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async close() {
        return this.pool.end();
    }
}

const db = new PostgreSqlDatabase();
=======
const { Pool } = require('pg');
const path = require('path');

class PostgreSqlDatabase {
    constructor() {
        // Check if DATABASE_URL is provided
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
        }
        
        // Use Render's DATABASE_URL environment variable
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Render's PostgreSQL
            },
            max: 20, // max number of clients in the pool
            idleTimeoutMillis: 30000, // close idle clients after 30 seconds
            connectionTimeoutMillis: 5000, // return an error after 5 seconds if connection could not be established
        });
        
        this.init();
    }

    init() {
        // Create tables if they don't exist
        this.createTables();
    }

    async createTables() {
        try {
            // Users table
            await this.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    password_hash VARCHAR(255) NOT NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    kyc_status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            `);

            // Wallets table
            await this.query(`
                CREATE TABLE IF NOT EXISTS wallets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER UNIQUE REFERENCES users (id) ON DELETE CASCADE,
                    balance DECIMAL(15,2) DEFAULT 0.00,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Transactions table
            await this.query(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    type VARCHAR(20) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    balance_before DECIMAL(15,2) NOT NULL,
                    balance_after DECIMAL(15,2) NOT NULL,
                    payment_method VARCHAR(50),
                    transaction_id VARCHAR(100),
                    bank_details TEXT,
                    description TEXT,
                    status VARCHAR(20) DEFAULT 'completed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Deposit Requests table
            await this.query(`
                CREATE TABLE IF NOT EXISTS deposit_requests (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    amount DECIMAL(15,2) NOT NULL,
                    upi_id VARCHAR(100),
                    screenshot TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP
                )
            `);

            // Withdrawal Requests table
            await this.query(`
                CREATE TABLE IF NOT EXISTS withdrawal_requests (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    amount DECIMAL(15,2) NOT NULL,
                    upi_id VARCHAR(100),
                    screenshot TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP
                )
            `);

            // Game Rounds table
            await this.query(`
                CREATE TABLE IF NOT EXISTS game_rounds (
                    id SERIAL PRIMARY KEY,
                    round_id VARCHAR(50) UNIQUE NOT NULL,
                    start_time TIMESTAMP NOT NULL,
                    end_time TIMESTAMP NOT NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Bets table
            await this.query(`
                CREATE TABLE IF NOT EXISTS bets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
                    round_id VARCHAR(50) REFERENCES game_rounds (round_id) ON DELETE CASCADE,
                    bet_type VARCHAR(20) NOT NULL,
                    bet_option VARCHAR(20) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    payout DECIMAL(15,2),
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Results table
            await this.query(`
                CREATE TABLE IF NOT EXISTS results (
                    id SERIAL PRIMARY KEY,
                    round_id VARCHAR(50) UNIQUE REFERENCES game_rounds (round_id) ON DELETE CASCADE,
                    result_number INTEGER NOT NULL,
                    result_color VARCHAR(20) NOT NULL,
                    result_size VARCHAR(20) NOT NULL,
                    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Admins table
            await this.query(`
                CREATE TABLE IF NOT EXISTS admins (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            `);

            // Insert default admin if not exists
            const result = await this.query(
                "SELECT id FROM admins WHERE username = $1", 
                ['admin']
            );
            
            if (result.rows.length === 0) {
                const crypto = require('crypto');
                const defaultPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');
                await this.query(
                    "INSERT INTO admins (username, email, password, role) VALUES ($1, $2, $3, $4)",
                    ['admin', 'admin@wingocasino.com', defaultPasswordHash, 'super_admin']
                );
            }

            console.log('✅ PostgreSQL tables created successfully');
        } catch (error) {
            console.error('❌ Error creating PostgreSQL tables:', error);
        }
    }

    async query(text, params = []) {
        const start = Date.now();
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;
        console.log(' executing query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
        return res;
    }

    async transaction(queries) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            const results = [];
            for (const queryObj of queries) {
                const result = await client.query(queryObj.sql, queryObj.params);
                results.push(result);
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async close() {
        return this.pool.end();
    }
}

const db = new PostgreSqlDatabase();
>>>>>>> ff6db2916f42106ebdfa88d8e8ce71566ff30a08
module.exports = db;