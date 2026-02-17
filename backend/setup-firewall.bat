@echo off
REM Admin elevation script for adding firewall rule
REM This batch file will prompt for admin privileges

setlocal enabledelayedexpansion

REM Check if already running as admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
)

REM Now running as admin
cls
echo.
echo =========================================
echo Firewall Configuration for Node.js
echo =========================================
echo.
echo Adding firewall rule to allow Node.js...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0add-firewall-rule.ps1'"

if %errorlevel% equ 0 (
    echo.
    echo Firewall rule added successfully!
    echo.
    echo Next: Start the backend and test
    echo.
) else (
    echo.
    echo ERROR: Failed to add firewall rule
    echo.
)

pause
