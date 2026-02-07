# Deploying Wingo Casino to Render.com

## Prerequisites
- GitHub account
- Render.com account
- This repository pushed to GitHub

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit: Wingo Casino application"
git branch -M main
git remote add origin https://github.com/yourusername/wingo-casino.git
git push -u origin main
```

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing this code
5. Render will automatically detect and deploy using render.yaml

#### Option B: Manual Web Service Creation
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure settings:

**Basic Settings:**
- Name: `wingo-casino`
- Region: Choose your preferred region
- Branch: `main`
- Root Directory: `/`

**Build Settings:**
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
DB_HOST=${your_render_database_host}
DB_PORT=5432
DB_USER=${your_render_database_user}
DB_PASSWORD=${your_render_database_password}
DB_NAME=${your_render_database_name}
JWT_SECRET=${generate_a_secure_secret}
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=${generate_another_secure_secret}
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Create Database
1. In Render Dashboard, click "New +" → "Database"
2. Choose "PostgreSQL" (free tier)
3. Name: `wingo-db`
4. Database name: `wingo_casino`
5. User: `wingo_user`
6. After creation, copy the database connection details

### 4. Update Environment Variables
1. Go back to your web service settings
2. Update the database environment variables with the actual values from your Render database
3. Set secure JWT secrets

### 5. Run Database Migrations
After deployment, you'll need to run the database schema:

1. Connect to your Render PostgreSQL database using a tool like pgAdmin or psql
2. Run the SQL commands from `database/schema.sql`
3. Or use Render's database console to execute the schema

### 6. Test Deployment
1. Visit your deployed URL (something like `https://wingo-casino.onrender.com`)
2. Test user registration and login
3. Verify game functionality
4. Test admin panel at `/admin-login`

## Environment Variables Explained

- `NODE_ENV`: Set to "production" for production environment
- `PORT`: Render assigns port 10000, but your app should listen on process.env.PORT
- `DB_*`: Database connection details from Render PostgreSQL
- `JWT_SECRET`: Secret key for signing JWT tokens (generate a secure random string)
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens (different from JWT_SECRET)
- `JWT_EXPIRES_IN`: Access token expiration time
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration time

## Important Notes

1. **Free Tier Limitations:**
   - Web services sleep after 15 minutes of inactivity
   - Database is limited to 1GB storage
   - May experience cold starts

2. **Security:**
   - Change default admin credentials in production
   - Use strong, unique JWT secrets
   - Enable HTTPS (automatic with Render)

3. **Monitoring:**
   - Check logs in Render dashboard
   - Monitor database usage
   - Set up alerts for your service

## Troubleshooting

**Common Issues:**
- Database connection errors: Verify environment variables
- Build failures: Check package.json dependencies
- Application errors: Check logs in Render dashboard
- 503 errors: Service may be sleeping, refresh to wake it up

**Support:**
- Render Docs: https://render.com/docs
- GitHub Issues: For application-specific problems