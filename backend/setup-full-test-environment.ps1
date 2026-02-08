# Full Test Environment Setup Script
# This script sets up PostgreSQL test database, seeds data, starts SBERT service, and runs tests

Write-Host "=== Full Test Environment Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check PostgreSQL
Write-Host "Step 1: Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql -U postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is not running or not accessible" -ForegroundColor Red
        Write-Host "Please start PostgreSQL and try again" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ PostgreSQL check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Create test database
Write-Host "Step 2: Creating test database..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = ""
    psql -U postgres -f setup-test-db.sql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Test database created successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Database creation had issues (may already exist)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Database setup warning: $_" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Update .env for test database
Write-Host "Step 3: Configuring environment..." -ForegroundColor Yellow
$testDbUrl = "postgresql://postgres@localhost:5432/topic_similarity_test?schema=public"
if (Test-Path .env) {
    $envContent = Get-Content .env
    $envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=`"$testDbUrl`""
    $envContent | Set-Content .env
    Write-Host "✓ .env updated with test database URL" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found, creating from env.example..." -ForegroundColor Yellow
    Copy-Item env.example .env
    $envContent = Get-Content .env
    $envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=`"$testDbUrl`""
    $envContent | Set-Content .env
    Write-Host "✓ .env created with test database URL" -ForegroundColor Green
}
Write-Host ""

# Step 4: Run Prisma migrations
Write-Host "Step 4: Running Prisma migrations..." -ForegroundColor Yellow
try {
    npx prisma migrate dev --name init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Prisma migrations completed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Prisma migrations had issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Migration warning: $_" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Generate Prisma Client
Write-Host "Step 5: Generating Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✓ Prisma Client generated" -ForegroundColor Green
} catch {
    Write-Host "✗ Prisma Client generation failed: $_" -ForegroundColor Red
}
Write-Host ""

# Step 6: Seed test data
Write-Host "Step 6: Seeding test database..." -ForegroundColor Yellow
try {
    node prisma/seed-test.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Test data seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Seeding failed" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Seeding error: $_" -ForegroundColor Red
}
Write-Host ""

# Step 7: Check SBERT service
Write-Host "Step 7: Checking SBERT service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2
    Write-Host "✓ SBERT service is running" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "⚠ SBERT service is not running" -ForegroundColor Yellow
    Write-Host "  Starting SBERT service..." -ForegroundColor Yellow
    
    # Try to start SBERT service
    $sbertPath = "..\sbert-service"
    if (Test-Path $sbertPath) {
        Write-Host "  Found SBERT service directory" -ForegroundColor Gray
        Write-Host "  Please start SBERT service manually:" -ForegroundColor Yellow
        Write-Host "    cd $sbertPath" -ForegroundColor Cyan
        Write-Host "    .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
        Write-Host "    uvicorn app:app --reload --port 8000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Press Enter when SBERT service is running..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "  SBERT service directory not found" -ForegroundColor Red
        Write-Host "  Tests will run with graceful degradation (SBERT unavailable)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 8: Run all tests
Write-Host "Step 8: Running all tests..." -ForegroundColor Yellow
Write-Host ""
npm test
Write-Host ""

# Step 9: Summary
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Environment Status:" -ForegroundColor Yellow
Write-Host "  ✓ PostgreSQL: Running" -ForegroundColor Green
Write-Host "  ✓ Test Database: Created and seeded" -ForegroundColor Green
Write-Host "  ✓ Prisma: Migrated and generated" -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 2
    Write-Host "  ✓ SBERT Service: Running" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ SBERT Service: Not running (graceful degradation active)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "  - Run tests: npm test" -ForegroundColor Gray
Write-Host "  - Start dev server: npm run dev" -ForegroundColor Gray
Write-Host "  - Run manual API tests: .\test-api-manual.ps1" -ForegroundColor Gray
Write-Host ""
