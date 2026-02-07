# Wingo Casino - Real Money Gaming Platform

A complete Wingo/Color-Prediction casino platform built with Node.js, Express, and MySQL for real money gaming.

## 🎯 Features

### Player Features
- **User Authentication**: Secure JWT-based registration and login
- **Real Money Wallet**: Deposit, withdraw, and balance management
- **Wingo 1-Minute Game**: 60-second betting rounds
- **Multiple Bet Types**: 
  - Big/Small (5-9 / 0-4)
  - Colors (Red, Green, Violet)
  - Numbers (0-9)
- **Real-time Game Results**: Automatic result generation and settlement
- **Transaction History**: Complete financial tracking
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Admin Dashboard**: Real-time statistics and analytics
- **User Management**: View, activate, suspend users
- **Balance Control**: Add/subtract user funds
- **Game Control**: Monitor current bets, force results
- **Transaction Monitoring**: Complete financial oversight
- **Bet History**: Detailed betting records

## 📁 Project Structure

```
wingo-casino/
├── server/
│   ├── index.js              # Main server entry point
│   ├── app.js                # Express application setup
│   ├── db.js                 # Database connection
│   ├── config.js             # Configuration settings
│   ├── scheduler.js          # Game round scheduler
│   ├── routes/               # API route definitions
│   ├── controllers/          # Business logic
│   ├── middleware/           # Authentication middleware
│   └── utils/                # Utility functions
├── public/                   # Frontend files
├── database/
│   └── schema.sql            # Database structure
├── .env                      # Environment variables
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 5.7+
- npm or yarn

### Installation

1. **Quick Setup (Windows):**
```bash
setup.bat
```

2. **Manual Setup:**
```bash
cd wingo-casino
npm install
```

2. **Setup MySQL database:**
```sql
CREATE DATABASE wingo_casino;
```

3. **Import database schema:**
```bash
mysql -u username -p wingo_casino < database/schema.sql
```

4. **Configure environment:**
Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=wingo_casino
```

5. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

6. **Access the application:**
- Player site: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- API docs: http://localhost:3000/api/health

## 🔧 Configuration

### Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wingo_casino

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Payment (Razorpay)
PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## 🎮 Game Rules

### Wingo 1-Minute Game
- **Duration**: 60 seconds per round
- **Betting Window**: Open for 55 seconds, closes 5 seconds before result
- **Results**: Automatically generated server-side

### Payouts
- **Big/Small**: 2x payout
- **Colors**: 
  - Red/Green: 2x payout
  - Violet: 4.5x payout
- **Numbers**: 9x payout

## 🔐 Default Admin Credentials

- **Username**: admin
- **Password**: admin123
- **Login**: http://localhost:3000/admin

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### User Operations
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Wallet Operations
- `GET /api/wallet/balance` - Check balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/transactions` - Transaction history

### Game Operations
- `GET /api/game/status` - Current game status
- `GET /api/game/history` - Game history
- `POST /api/bet/place` - Place bet
- `GET /api/bet/history` - Bet history

### Admin Operations
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/:id/balance` - Adjust user balance
- `GET /api/admin/game-control` - Game monitoring
- `POST /api/admin/force-result` - Force game result
- `GET /api/admin/bets` - All bets

## 🚀 Deployment

### Render.com Deployment

1. **Create Render account** and connect GitHub repository
2. **Create MySQL database** on Render
3. **Set environment variables** in Render dashboard
4. **Deploy web service** with:
   - Build command: `npm install`
   - Start command: `npm start`

### Environment Variables for Render
```
DB_HOST=your-render-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

## 📱 Frontend Pages

The application serves the following pages:
- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/home` - User dashboard
- `/game` - Wingo game interface
- `/wallet` - Wallet management
- `/history` - Betting history
- `/profile` - User profile
- `/admin` - Admin panel

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption
- **Input Validation**: Sanitized user inputs
- **SQL Injection Protection**: Prepared statements
- **Rate Limiting**: Prevent abuse
- **Admin Authorization**: Role-based access control

## 🎯 Payment Integration

Currently configured for Razorpay integration:
- Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
- Implement payment verification in `wallet.controller.js`
- Add webhook handling for payment confirmations

## 📊 Monitoring

- Real-time game status via `/api/game/status`
- Admin dashboard with user statistics
- Transaction logging for all financial operations
- Game round history and result tracking

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error (ECONNREFUSED):**
- **Windows**: Start MySQL service from Services.msc or MySQL Workbench
- **All Platforms**: Verify MySQL is running on port 3306
- Check database credentials in `.env`
- Ensure `wingo_casino` database exists
- Run `database/schema.sql` to create tables

**Quick MySQL Setup (Windows):**
1. Download MySQL from https://dev.mysql.com/downloads/mysql/
2. Install MySQL Server
3. During installation, set root password
4. Start MySQL service
5. Create database: `CREATE DATABASE wingo_casino;`
6. Import schema: `mysql -u root -p wingo_casino < database/schema.sql`

**JWT Authentication Issues:**
- Check `JWT_SECRET` in environment variables
- Verify token expiration settings
- Ensure proper token format in requests

**Game Scheduler Not Working:**
- Check server logs for cron errors
- Verify `node-cron` dependency is installed
- Ensure server has proper time synchronization

## 📄 License

This project is for educational purposes. For production use, ensure compliance with local gambling regulations.

## 🤝 Support

For issues and questions, please check the server logs and verify all configuration settings.