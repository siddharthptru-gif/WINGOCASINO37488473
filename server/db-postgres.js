// PostgreSQL database configuration for Render deployment
const { Pool } = require('pg');
require('dotenv').config();

// Database configuration for Render PostgreSQL
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        throw error;
    }
}

// Close all connections
async function close() {
    try {
        await pool.end();
        console.log('🔒 PostgreSQL connections closed');
    } catch (error) {
        console.error('Error closing database connections:', error);
    }
}

// Execute query with error handling
async function query(text, params = []) {
    try {
        const result = await pool.query(text, params);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Execute transaction
async function transaction(queries) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const results = [];
        for (const { text, params } of queries) {
            const result = await client.query(text, params);
            results.push(result.rows);
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

module.exports = {
    pool,
    testConnection,
    close,
    query,
    transaction
};