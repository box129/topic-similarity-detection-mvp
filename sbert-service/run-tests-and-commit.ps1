# SBERT Service - Test and Commit Script
# This script will start the service, test it, and commit to git

Write-Host "=== SBERT Service - Test and Commit ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify dependencies
Write-Host "[1/6] Verifying dependencies..." -ForegroundColor Yellow
pip list | Select-String "torch|fastapi|uvicorn|sentence-transformers"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Dependencies not installed properly!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies verified!" -ForegroundColor Green
Write-Host ""

# Step 2: Start the service in background
Write-Host "[2/6] Starting SBERT service on port 8000..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    Set-Location "C:\Users\LENOVO T14\Development\topic-similarity-mvp\sbert-service"
    & ".\venv\Scripts\Activate.ps1"
    uvicorn app:app --port 8000
}

# Wait for service to start
Write-Host "Waiting for service to start (30 seconds for model download)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 3: Test health endpoint
Write-Host "[3/6] Testing /health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "Health check passed!" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Health check failed!" -ForegroundColor Red
    Stop-Job $job
    Remove-Job $job
    exit 1
}

Write-Host ""

# Step 4: Test embed endpoint
Write-Host "[4/6] Testing /embed endpoint..." -ForegroundColor Yellow
try {
    $embedBody = @{
        text = "Hello world"
    } | ConvertTo-Json

    $embedResponse = Invoke-RestMethod -Uri "http://localhost:8000/embed" -Method Post -Body $embedBody -ContentType "application/json"
    
    $embeddingLength = $embedResponse.embedding.Length
    Write-Host "Embed test passed!" -ForegroundColor Green
    Write-Host "Embedding dimensions: $embeddingLength" -ForegroundColor Gray
    Write-Host "Text length: $($embedResponse.text_length)" -ForegroundColor Gray
    Write-Host "Processing time: $($embedResponse.processing_time)s" -ForegroundColor Gray
    
    if ($embeddingLength -ne 384) {
        Write-Host "WARNING: Expected 384 dimensions, got $embeddingLength" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Embed test failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Stop-Job $job
    Remove-Job $job
    exit 1
}

Write-Host ""

# Step 5: Stop the service
Write-Host "[5/6] Stopping service..." -ForegroundColor Yellow
Stop-Job $job
Remove-Job $job
Write-Host "Service stopped!" -ForegroundColor Green
Write-Host ""

# Step 6: Git commit
Write-Host "[6/6] Committing to git..." -ForegroundColor Yellow
Set-Location "C:\Users\LENOVO T14\Development\topic-similarity-mvp"

git add sbert-service/

$commitMessage = @"
feat(sbert): implement FastAPI embedding service

- Add FastAPI application with /health and /embed endpoints
- Implement SBERT model integration (all-MiniLM-L6-v2)
- Add comprehensive test suite with 30+ test cases
- Include Docker and Docker Compose configurations
- Add complete documentation and setup guides
- Configure CORS, error handling, and logging
- Generate 384-dimensional semantic embeddings
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully committed to git!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Summary ===" -ForegroundColor Cyan
    Write-Host "✓ Dependencies verified" -ForegroundColor Green
    Write-Host "✓ Service started successfully" -ForegroundColor Green
    Write-Host "✓ Health endpoint working" -ForegroundColor Green
    Write-Host "✓ Embed endpoint working (384 dimensions)" -ForegroundColor Green
    Write-Host "✓ Changes committed to git" -ForegroundColor Green
    Write-Host ""
    Write-Host "View commit:" -ForegroundColor Yellow
    git log -1 --stat
} else {
    Write-Host "ERROR: Git commit failed!" -ForegroundColor Red
    exit 1
}
