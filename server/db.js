const mysql = require('mysql2/promise');
const inMemoryDB = require('./db-memory');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wingo_casino',
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create connection pool
let pool;
let useInMemoryDB = false;

try {
    pool = mysql.createPool(dbConfig);
} catch (error) {
    console.log('⚠️  MySQL configuration error, using in-memory database for development');
    useInMemoryDB = true;
    inMemoryDB.initializeSampleData();
}

// Test database connection
async function testConnection() {
    if (useInMemoryDB) {
        console.log('✅ Using in-memory database for development');
        return true;
    }
    
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        console.log('⚠️  Falling back to in-memory database for development');
        useInMemoryDB = true;
        inMemoryDB.initializeSampleData();
        return true;
    }
}

// Close all connections
async function close() {
    if (useInMemoryDB) {
        console.log('🔒 In-memory database session ended');
        return;
    }
    
    try {
        await pool.end();
        console.log('🔒 MySQL connections closed');
    } catch (error) {
        console.error('Error closing database connections:', error);
    }
}

// Execute query with error handling
async function query(sql, params = []) {
    if (useInMemoryDB) {
        return await inMemoryDB.query(sql, params);
    }
    
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Execute multiple queries in transaction
async function transaction(queries) {
    if (useInMemoryDB) {
        return await inMemoryDB.transaction(async (tx) => {
            const results = [];
            for (const { sql, params } of queries) {
                const rows = await tx.query(sql, params);
                results.push(rows);
            }
            return results;
        });
    }
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { sql, params } of queries) {
            const [rows] = await connection.execute(sql, params);
            results.push(rows);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    testConnection,
    close,
    query,
    transaction
};