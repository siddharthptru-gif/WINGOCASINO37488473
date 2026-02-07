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

**Environment Variables (Auto-configured):**
```
NODE_ENV=production
PORT=10000
DB_TYPE=memory
JWT_SECRET=${auto_generated}
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=${auto_generated}
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

*Note: Render will automatically generate secure JWT secrets*

### 3. Test Deployment
Since this is a single web service deployment with in-memory database:
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