@echo off
echo ========================================
echo Wingo Casino - GitHub Deployment Setup
echo ========================================
echo.

echo Initializing Git repository...
git init
echo.

echo Adding all files to Git...
git add .
echo.

echo Creating initial commit...
git commit -m "Initial commit: Wingo Casino Node.js application for Render deployment"
echo.

echo Setting main branch...
git branch -M main
echo.

echo Repository setup complete!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_GITHUB_REPO_URL
echo 4. Run: git push -u origin main
echo.
echo For detailed deployment instructions, see DEPLOY-RENDER.md
echo.
pause