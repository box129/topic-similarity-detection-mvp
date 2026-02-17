# Script to run Node.js backend with admin privileges
# This allows the backend to bind to network ports

param(
    [switch]$AsAdmin = $false
)

# If not already running as admin, restart as admin
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Requesting admin privileges..." -ForegroundColor Yellow
    Start-Process -FilePath powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File '$PSCommandPath' -AsAdmin" -Verb RunAs
    exit
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
cd "c:\Users\LENOVO T14\Development\topic-similarity-mvp\backend"

# Show configuration
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   Port: 8080"
Write-Host "   Environment: development"
Write-Host "   Database: Neon PostgreSQL"
Write-Host ""

# Start the server
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Write-Host ""

node src/server.js

Write-Host ""
Write-Host "⏹️  Backend stopped" -ForegroundColor Yellow
