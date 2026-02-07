require('dotenv').config();

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';

let dbModule;
if (isProduction) {
    try {
        if (!process.env.DATABASE_URL) {
            console.warn('⚠️  DATABASE_URL not found in production environment, falling back to SQLite');
            dbModule = require('./db-sqlite');
        } else {
            dbModule = require('./db-postgres');
        }
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        console.log('🔄 Falling back to SQLite database');
        dbModule = require('./db-sqlite');
    }
} else {
    dbModule = require('./db-sqlite');
}

const dbName = isProduction ? 'PostgreSQL' : 'SQLite';
console.log(`🎮 Using ${dbName} database for ${isProduction ? 'production' : 'development'}`);

// Test database connection
async function testConnection() {
    try {
        // Test database connection
        await dbModule.query('SELECT 1');
        console.log(`✅ ${dbName} database connected successfully`);
        return true;
    } catch (error) {
        console.error(`❌ ${dbName} connection failed:`, error.message);
        return false;
    }
}

// Close all connections
async function close() {
    try {
        await dbModule.close();
        console.log(`🔒 ${dbName} database closed`);
    } catch (error) {
        console.error(`Error closing ${dbName} database:`, error);
    }
}

// Execute query with error handling
async function query(sql, params = []) {
    try {
        const rows = await dbModule.query(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Execute run with error handling (for INSERT/UPDATE/DELETE)
async function run(sql, params = []) {
    try {
        const result = await dbModule.run(sql, params);
        return result;
    } catch (error) {
        console.error('Database run error:', error);
        throw error;
    }
}

// Execute multiple queries in transaction
async function transaction(queries) {
    try {
        const results = await dbModule.transaction(queries);
        return results;
    } catch (error) {
        console.error('Database transaction error:', error);
        throw error;
    }
}

module.exports = {
    testConnection,
    close,
    query,
    run,
    transaction
};