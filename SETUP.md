# Wingo Casino - Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher) - Download from https://nodejs.org/
2. **MySQL** (v8.0 or higher) - Download from https://dev.mysql.com/downloads/mysql/

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MySQL Database

#### Option A: Using MySQL Command Line
```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE wingo_casino;

-- Use the database
USE wingo_casino;

-- Create tables (run the schema.sql file)
SOURCE database/schema.sql;
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create a new schema named `wingo_casino`
4. Open and run `database/schema.sql`

### 3. Configure Environment Variables

Edit the `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=wingo_casino
```

### 4. Start the Server
```bash
npm start
```

The server will start on http://localhost:3000

## Default Admin Credentials

For admin panel access:
- Username: admin
- Password: admin123

Visit http://localhost:3000/admin-login

## Development Commands

```bash
# Start server in development mode (with auto-restart)
npm run dev

# Run tests (when available)
npm test
```

## Troubleshooting

### Database Connection Issues
1. Make sure MySQL service is running
2. Check if the database `wingo_casino` exists
3. Verify your MySQL credentials in `.env` file
4. Ensure MySQL is accepting connections on localhost:3306

### Common Windows Issues
- If you get "ECONNREFUSED" errors, MySQL service might not be running
- Start MySQL service from Services.msc or MySQL Workbench
- Make sure no other application is using port 3306

### Port Already in Use
If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

## File Structure
```
wingo-casino/
├── server/              # Backend API
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── app.js          # Express app setup
│   ├── db.js           # Database connection
│   ├── config.js       # Configuration
│   └── scheduler.js    # Game scheduler
├── public/             # Frontend files
│   ├── index.html      # Main page
│   ├── login.html      # Login page
│   └── ...             # Other HTML pages
├── database/           # Database files
│   └── schema.sql      # Database schema
├── .env               # Environment variables
├── package.json       # Dependencies
└── README.md          # This file
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/refresh` - Refresh token

### User
- GET `/api/user/profile` - Get user profile
- PUT `/api/user/update` - Update profile
- POST `/api/user/change-password` - Change password

### Wallet
- GET `/api/wallet/balance` - Get wallet balance
- POST `/api/wallet/deposit` - Deposit funds
- POST `/api/wallet/withdraw` - Withdraw funds
- GET `/api/wallet/transactions` - Transaction history

### Game
- GET `/api/game/status` - Current game status
- GET `/api/game/history` - Game history

### Betting
- POST `/api/bet/place` - Place a bet
- GET `/api/bet/history` - Bet history

### Admin
- GET `/api/admin/dashboard` - Dashboard stats
- GET `/api/admin/users` - User management
- POST `/api/admin/force-result` - Force game result
- GET `/api/admin/bets` - All bets

## Security Notes

- Change JWT secrets in production
- Use strong passwords for MySQL
- Enable SSL/TLS for production
- Regular database backups
- Monitor for suspicious activity