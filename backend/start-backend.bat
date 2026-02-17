@echo off
REM Start Node.js backend server
REM This batch file starts the backend and keeps it running

echo.
echo ================================
echo Backend Server Startup
echo ================================
echo.

cd /d "%~dp0"

REM Check if node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Display Node version
echo Node.js version:
node --version
echo.

REM Start the server
echo Starting backend server...
echo.
node start-server-wrapped.js

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo Server stopped with an error. Press any key to exit...
    pause
    exit /b 1
)
