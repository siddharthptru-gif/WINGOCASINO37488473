@echo off
echo ========================================
echo Wingo Casino - Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Install MySQL if not already installed
echo 2. Create MySQL database 'wingo_casino'
echo 3. Run database/schema.sql to create tables
echo 4. Update .env file with your MySQL credentials
echo 5. Run 'npm start' to start the server
echo.
echo For detailed instructions, see SETUP.md
echo.
pause