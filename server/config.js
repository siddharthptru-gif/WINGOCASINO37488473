require('dotenv').config();

module.exports = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database configuration
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'wingo_casino'
    },
    
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'wingo-casino-jwt-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'wingo-casino-refresh-secret-key-change-in-production',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    
    // Game configuration
    game: {
        roundDuration: 60000, // 60 seconds in milliseconds
        minBet: 10, // Minimum bet amount
        maxBet: 10000, // Maximum bet amount
        bettingWindow: 55000 // 55 seconds (5 seconds before result)
    },
    
    // Payment configuration
    payment: {
        gateway: process.env.PAYMENT_GATEWAY || 'razorpay', // Default payment gateway
        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID || '',
            keySecret: process.env.RAZORPAY_KEY_SECRET || ''
        }
    },
    
    // Security configuration
    security: {
        bcryptRounds: 12,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },
    
    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
    }
};