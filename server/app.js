const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const gameRoutes = require('./routes/game.routes');
const betRoutes = require('./routes/bet.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');

// Import admin controller for direct login route
const { adminLogin } = require('./controllers/admin.controller');

// Import middleware
const { authenticateToken } = require('./middleware/auth.middleware');
const { authenticateAdmin } = require('./middleware/admin.middleware');

// Import scheduler
const { startGameScheduler } = require('./scheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Wingo Casino API'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/wallet', authenticateToken, walletRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/bet', authenticateToken, betRoutes);
app.use('/api/payment', authenticateToken, paymentRoutes);

// Admin login route (no authentication required)
app.post('/api/admin/login', adminLogin);

// Admin routes (require authentication)
app.use('/api/admin', authenticateAdmin, adminRoutes);

// Public routes (no auth required)
app.get('/api/game/status', require('./controllers/game.controller').getCurrentGame);
app.get('/api/game/history', require('./controllers/game.controller').getGameHistory);

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
});

app.get('/game-wingo', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/game-wingo.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/game-wingo.html'));
});

app.get('/wallet', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/wallet.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/history.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profile.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin-login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start game scheduler
startGameScheduler();

module.exports = app;