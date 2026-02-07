require('dotenv').config();

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';
const dbModule = isProduction ? require('./db-postgres') : require('./db-sqlite');

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
    transaction
};