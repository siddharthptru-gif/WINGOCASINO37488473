const app = require('./app');
const config = require('./config');
const db = require('./db');

// Start server
const PORT = process.env.PORT || config.port || 3000;

async function startServer() {
    try {
        // Test database connection
        await db.testConnection();
        console.log('✅ Database connected successfully');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🎮 Wingo Casino - Real Money Platform`);
            console.log(`📅 ${new Date().toISOString()}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    await db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    await db.close();
    process.exit(0);
});

// Start the application
startServer();