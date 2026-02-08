# Interactive Database Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Setup - Interactive Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will set up the test database for the Topic Similarity API." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please enter your PostgreSQL password when prompted." -ForegroundColor Yellow
Write-Host "If you don't have a password, just press Enter." -ForegroundColor Yellow
Write-Host ""

# Create database using psql
Write-Host "Creating test database..." -ForegroundColor Cyan
Write-Host ""

$sqlCommands = @"
DROP DATABASE IF EXISTS topic_similarity_test;
CREATE DATABASE topic_similarity_test;
\c topic_similarity_test
CREATE EXTENSION IF NOT EXISTS vector;
SELECT 'Database setup complete!' as status;
"@

$sqlCommands | psql -U postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Database created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Now run migrations
    Write-Host "Running Prisma migrations..." -ForegroundColor Cyan
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/topic_similarity_test?schema=public"
    
    npx prisma migrate dev --name init --skip-seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migrations completed!" -ForegroundColor Green
        
        # Generate Prisma Client
        Write-Host ""
        Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
        npx prisma generate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Prisma Client generated!" -ForegroundColor Green
            
            # Seed data
            Write-Host ""
            Write-Host "Seeding test data..." -ForegroundColor Cyan
            node prisma/seed-test.js
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "✓ Database Setup Complete!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "Next steps:" -ForegroundColor Yellow
                Write-Host "1. Run tests: npm test" -ForegroundColor White
                Write-Host "2. Start server: npm run dev" -ForegroundColor White
                Write-Host "3. Run integration tests: .\run-all-tests.ps1" -ForegroundColor White
                Write-Host ""
            }
            else {
                Write-Host "✗ Seeding failed" -ForegroundColor Red
            }
        }
        else {
            Write-Host "✗ Prisma Client generation failed" -ForegroundColor Red
        }
    }
    else {
        Write-Host "✗ Migrations failed" -ForegroundColor Red
    }
}
else {
    Write-Host ""
    Write-Host "✗ Database creation failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor White
    Write-Host "2. Check if you have the correct password" -ForegroundColor White
    Write-Host "3. Try running: psql -U postgres" -ForegroundColor White
    Write-Host ""
}
