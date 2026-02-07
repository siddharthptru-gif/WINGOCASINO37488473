# Render Deployment Guide for Wingo Casino

## 🚨 STOPPED LOCAL SERVER
The local development server running on port 3000 has been stopped. You can now proceed with the deployment to Render.

## 📁 Files to Update in Your GitHub Repository

### 1. **render.yaml** (Main Deployment Configuration)
This file already exists in your repository and configures the Render deployment:

```yaml
services:
- type: web
  name: wingo-casino
  env: docker
  repo: https://github.com/YOUR_USERNAME/wingo-casino  # Update with your repo
  region: oregon
  plan: free
  branch: main
  healthCheckPath: /api/health
  envVars:
    - key: NODE_VERSION
      value: 18
    - key: DATABASE_URL
      fromDatabase:
        name: wingo-db
        property: connectionString
    - key: JWT_SECRET
      sync: false
    - key: JWT_REFRESH_SECRET
      sync: false
```

### 2. **Dockerfile** (Container Configuration)
Replace or add this Dockerfile to your repository root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
```

### 3. **package.json** (Ensure Proper Start Script)
Make sure your package.json has the correct start script (it should already):

```json
{
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js"
  }
}
```

### 4. **Environment Variables Setup**
You'll need to configure these environment variables in Render:

- `PORT`: Provided by Render (set automatically)
- `DATABASE_URL`: Render PostgreSQL database connection string
- `JWT_SECRET`: Secret for JWT tokens (set in Render dashboard)
- `JWT_REFRESH_SECRET`: Secret for refresh tokens (set in Render dashboard)

### 5. **Database Migration Strategy**
Since your application now uses SQLite for local development but will use PostgreSQL on Render, you'll need to update the database adapter:

Replace `server/db-sqlite.js` with a PostgreSQL adapter for production, or update the main `server/db.js` to conditionally use PostgreSQL when in production:

```javascript
// server/db.js - Updated for Render deployment
if (process.env.NODE_ENV === 'production') {
    // Use PostgreSQL for production
    module.exports = require('./db-postgres');
} else {
    // Use SQLite for development
    module.exports = require('./db-sqlite');
}
```

You'll need to create `server/db-postgres.js` with PostgreSQL implementation.

## ⚙️ Render Deployment Steps

### 1. **Update Your GitHub Repository**
Push these files to your GitHub repository:
- Commit all changes to your current codebase
- Add the Dockerfile if it doesn't exist
- Update render.yaml if needed
- Create db-postgres.js for PostgreSQL compatibility

### 2. **Configure Render Dashboard**
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect to your GitHub repository
4. Select your `wingo-casino` repository
5. Set Environment: `Docker` (since you're using Dockerfile)
6. Set Root Directory: `/` (or leave empty)
7. Set Branch: `main`
8. Set Health Check Path: `/api/health`

### 3. **Set Environment Variables in Render**
In the Render dashboard, under your service settings:
- `PORT`: Leave as auto-assigned by Render
- `DATABASE_URL`: Connect to a Render PostgreSQL database
- `JWT_SECRET`: Create a secure random string
- `JWT_REFRESH_SECRET`: Create another secure random string

### 4. **Create PostgreSQL Database on Render**
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Give it a name (e.g., "wingo-db")
3. Link it to your web service
4. The DATABASE_URL will be automatically populated

### 5. **Update Database Schema for PostgreSQL**
You'll need to convert your SQLite schema to PostgreSQL. Here's a PostgreSQL-compatible version:

```sql
-- PostgreSQL Schema for Wingo Casino
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
);

CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables following the same pattern...
```

## 🔄 Files to Update in Your Repository

### Primary Files to Commit:
1. `render.yaml` - Already exists in your repo
2. `Dockerfile` - Add this file to root
3. `server/db-postgres.js` - Create this file for PostgreSQL
4. `server/db.js` - Update to conditionally use different DB adapters
5. `package.json` - Verify start script (should already be correct)
6. `.env` - Update for production variables (optional, since Render sets these)

### Optional but Recommended:
- Update `README.md` with deployment instructions
- Add `.dockerignore` file to exclude unnecessary files

## 🚀 Deployment Commands (Local Testing)
Before deploying to Render, you can test locally with PostgreSQL:

```bash
# Install PostgreSQL client if not already installed
npm install pg pg-hstore

# Create db-postgres.js file with PostgreSQL implementation
# Test locally before pushing to GitHub
```

## ⚠️ Important Notes

1. **Data Migration**: When switching from SQLite to PostgreSQL, you'll need to migrate existing user data
2. **Environment Detection**: The app should automatically detect production environment and use PostgreSQL
3. **Health Check**: The `/api/health` endpoint is already implemented in your app
4. **Port Binding**: The app already reads the PORT environment variable

Your application is now ready for Render deployment! The local server has been stopped, and you can push the necessary files to your GitHub repository to trigger the Render deployment.