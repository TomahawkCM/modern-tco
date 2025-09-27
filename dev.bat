@echo off
REM TCO Development Environment Startup Script
REM Automated CPU-optimized development with health checks

echo ============================================
echo  TCO Development Environment Starting...
echo ============================================
echo.

REM Change to the correct directory
cd /d "%~dp0"

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Run the development startup script
echo Starting development environment with CPU optimization...
node scripts/dev-startup.js start

REM Keep window open if there's an error
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Development startup failed
    echo.
    echo Troubleshooting commands:
    echo   npm run processes:list     - Check running processes
    echo   npm run processes:cleanup  - Clean up orphaned processes
    echo   npm run system:health      - Check system health
    echo.
    pause
    exit /b 1
)

pause