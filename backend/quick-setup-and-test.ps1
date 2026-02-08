# Quick Setup and Test Script
# This script sets up the database and runs basic tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Setup and Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Step 1: Check if .env file exists
Write-Host "Step 1: Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.test..." -ForegroundColor Cyan
    Copy-Item ".env.test" ".env"
    Write-Host "⚠️  Please update DATABASE_URL password in .env file" -ForegroundColor Yellow
    Write-Host "Press any key to continue after updating .env..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "Dependencies already installed ✓" -ForegroundColor Green
}

# Step 3: Database setup
Write-Host ""
Write-Host "Step 3: Setting up database..." -ForegroundColor Yellow
Write-Host "This will create/reset the test database." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to cancel, or any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Creating database (you may need to enter PostgreSQL password)..." -ForegroundColor Cyan

# Create database using psql
$createDbScript = @"
DROP DATABASE IF EXISTS topic_similarity_test;
CREATE DATABASE topic_similarity_test;
\c topic_similarity_test
CREATE EXTENSION IF NOT EXISTS vector;
SELECT 'Database created successfully!' as status;
"@

$createDbScript | psql -U postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database created successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Database creation failed" -ForegroundColor Red
    Write-Host "Please create the database manually using setup-test-db.sql" -ForegroundColor Yellow
    exit 1
}

# Step 4: Run Prisma migrations
Write-Host ""
Write-Host "Step 4: Running Prisma migrations..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/topic_similarity_test?schema=public"

npx prisma migrate dev --name init --skip-seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrations completed" -ForegroundColor Green
} else {
    Write-Host "✗ Migrations failed" -ForegroundColor Red
    exit 1
}

# Step 5: Generate Prisma Client
Write-Host ""
Write-Host "Step 5: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "✗ Prisma Client generation failed" -ForegroundColor Red
    exit 1
}

# Step 6: Seed test data
Write-Host ""
Write-Host "Step 6: Seeding test data..." -ForegroundColor Yellow
node prisma/seed-test.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Test data seeded" -ForegroundColor Green
} else {
    Write-Host "✗ Seeding failed" -ForegroundColor Red
    exit 1
}

# Step 7: Run unit tests
Write-Host ""
Write-Host "Step 7: Running unit tests..." -ForegroundColor Yellow
npm test

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Unit tests passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests may require server to be running" -ForegroundColor Yellow
}

# Step 8: Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the server: npm run dev" -ForegroundColor White
Write-Host "2. Test the API: .\run-all-tests.ps1" -ForegroundColor White
Write-Host "3. View API docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Optional:" -ForegroundColor Yellow
Write-Host "- Start SBERT service: cd ../sbert-service; python -m uvicorn app:app --port 8000" -ForegroundColor White
Write-Host "- View database: npx prisma studio" -ForegroundColor White
Write-Host ""
