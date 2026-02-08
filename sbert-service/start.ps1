# Quick start script for SBERT Service
# Usage: .\start.ps1

Write-Host "Starting SBERT Service..." -ForegroundColor Green

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Cyan
$packages = pip list --format=freeze
if ($packages -notmatch "fastapi") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Start the service
Write-Host "`nStarting FastAPI server..." -ForegroundColor Green
Write-Host "Service will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

uvicorn app:app --reload --port 8000
