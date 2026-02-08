# Comprehensive Testing Script for Topic Similarity API
# This script runs all tests in sequence and generates a report

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Topic Similarity API - Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$testResults = @()

# Function to add test result
function Add-TestResult {
    param($Name, $Status, $Details)
    $script:testResults += [PSCustomObject]@{
        Test = $Name
        Status = $Status
        Details = $Details
    }
}

# Function to print section header
function Print-Section {
    param($Title)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host $Title -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
}

# 1. Check Prerequisites
Print-Section "1. Checking Prerequisites"

Write-Host "Checking Node.js..." -NoNewline
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host " ✓ $nodeVersion" -ForegroundColor Green
    Add-TestResult "Node.js Installation" "PASS" $nodeVersion
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Add-TestResult "Node.js Installation" "FAIL" "Node.js not installed"
}

Write-Host "Checking PostgreSQL..." -NoNewline
$pgVersion = psql --version 2>$null
if ($pgVersion) {
    Write-Host " ✓ $pgVersion" -ForegroundColor Green
    Add-TestResult "PostgreSQL Installation" "PASS" $pgVersion
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Add-TestResult "PostgreSQL Installation" "FAIL" "PostgreSQL not installed"
}

Write-Host "Checking npm packages..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✓ Installed" -ForegroundColor Green
    Add-TestResult "NPM Packages" "PASS" "node_modules exists"
} else {
    Write-Host " ✗ Not found, installing..." -ForegroundColor Yellow
    npm install
    Add-TestResult "NPM Packages" "WARN" "Packages installed during test run"
}

# 2. Check SBERT Service
Print-Section "2. Checking SBERT Service"

Write-Host "Testing SBERT health endpoint..." -NoNewline
try {
    $sbertHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host " ✓ Available" -ForegroundColor Green
    Add-TestResult "SBERT Service" "PASS" "Service is healthy"
} catch {
    Write-Host " ✗ Unavailable (will test graceful degradation)" -ForegroundColor Yellow
    Add-TestResult "SBERT Service" "WARN" "Service not available - graceful degradation will be tested"
}

# 3. Run Unit Tests
Print-Section "3. Running Unit Tests"

Write-Host "Running Jest tests..." -ForegroundColor Cyan
$testOutput = npm test 2>&1 | Out-String
Write-Host $testOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All unit tests passed" -ForegroundColor Green
    Add-TestResult "Unit Tests" "PASS" "All tests passed"
} else {
    Write-Host "✗ Some unit tests failed" -ForegroundColor Red
    Add-TestResult "Unit Tests" "FAIL" "Check output above for details"
}

# 4. Check if server is already running
Print-Section "4. Checking Server Status"

Write-Host "Checking if server is running on port 3000..." -NoNewline
try {
    $serverCheck = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host " ✓ Server is running" -ForegroundColor Green
    $serverWasRunning = $true
    Add-TestResult "Server Status" "INFO" "Server already running"
} catch {
    Write-Host " ✗ Server not running" -ForegroundColor Yellow
    $serverWasRunning = $false
    Add-TestResult "Server Status" "INFO" "Server needs to be started"
    
    Write-Host "Starting server in background..." -ForegroundColor Cyan
    $serverJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    
    Write-Host "Waiting for server to start..." -NoNewline
    Start-Sleep -Seconds 5
    
    try {
        $serverCheck = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host " ✓ Server started" -ForegroundColor Green
        Add-TestResult "Server Startup" "PASS" "Server started successfully"
    } catch {
        Write-Host " ✗ Server failed to start" -ForegroundColor Red
        Add-TestResult "Server Startup" "FAIL" "Could not connect to server"
        Write-Host "Stopping test execution" -ForegroundColor Red
        if ($serverJob) { Stop-Job $serverJob; Remove-Job $serverJob }
        exit 1
    }
}

# 5. API Integration Tests
Print-Section "5. Running API Integration Tests"

# Test 1: Basic similarity check
Write-Host "Test 1: Basic similarity check..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"topic": "Machine Learning Applications"}' `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    if ($response.topic -and $response.results -and $response.overallRisk) {
        Write-Host " ✓ PASS" -ForegroundColor Green
        Add-TestResult "API: Basic Similarity Check" "PASS" "Response structure correct"
    } else {
        Write-Host " ✗ FAIL (Invalid response structure)" -ForegroundColor Red
        Add-TestResult "API: Basic Similarity Check" "FAIL" "Invalid response structure"
    }
} catch {
    Write-Host " ✗ FAIL ($($_.Exception.Message))" -ForegroundColor Red
    Add-TestResult "API: Basic Similarity Check" "FAIL" $_.Exception.Message
}

# Test 2: With keywords
Write-Host "Test 2: Similarity check with keywords..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"topic": "Blockchain Technology", "keywords": "distributed systems, cryptocurrency"}' `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    if ($response.keywords -eq "distributed systems, cryptocurrency") {
        Write-Host " ✓ PASS" -ForegroundColor Green
        Add-TestResult "API: With Keywords" "PASS" "Keywords processed correctly"
    } else {
        Write-Host " ✗ FAIL" -ForegroundColor Red
        Add-TestResult "API: With Keywords" "FAIL" "Keywords not processed correctly"
    }
} catch {
    Write-Host " ✗ FAIL ($($_.Exception.Message))" -ForegroundColor Red
    Add-TestResult "API: With Keywords" "FAIL" $_.Exception.Message
}

# Test 3: Missing topic (should fail)
Write-Host "Test 3: Error handling - missing topic..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{}' `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host " ✗ FAIL (Should have returned error)" -ForegroundColor Red
    Add-TestResult "API: Error Handling (Missing Topic)" "FAIL" "Did not return error"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host " ✓ PASS (Correctly returned 400)" -ForegroundColor Green
        Add-TestResult "API: Error Handling (Missing Topic)" "PASS" "Correctly returned 400 error"
    } else {
        Write-Host " ✗ FAIL (Wrong error code)" -ForegroundColor Red
        Add-TestResult "API: Error Handling (Missing Topic)" "FAIL" "Wrong error code"
    }
}

# Test 4: Empty topic (should fail)
Write-Host "Test 4: Error handling - empty topic..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"topic": ""}' `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host " ✗ FAIL (Should have returned error)" -ForegroundColor Red
    Add-TestResult "API: Error Handling (Empty Topic)" "FAIL" "Did not return error"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host " ✓ PASS (Correctly returned 400)" -ForegroundColor Green
        Add-TestResult "API: Error Handling (Empty Topic)" "PASS" "Correctly returned 400 error"
    } else {
        Write-Host " ✗ FAIL (Wrong error code)" -ForegroundColor Red
        Add-TestResult "API: Error Handling (Empty Topic)" "FAIL" "Wrong error code"
    }
}

# Test 5: Algorithm status check
Write-Host "Test 5: Algorithm status verification..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"topic": "Test Topic"}' `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    $jaccard = $response.algorithmStatus.jaccard
    $tfidf = $response.algorithmStatus.tfidf
    $sbert = $response.algorithmStatus.sbert
    
    if ($jaccard -and $tfidf) {
        Write-Host " ✓ PASS (Jaccard: $jaccard, TF-IDF: $tfidf, SBERT: $sbert)" -ForegroundColor Green
        Add-TestResult "API: Algorithm Status" "PASS" "Jaccard: $jaccard, TF-IDF: $tfidf, SBERT: $sbert"
    } else {
        Write-Host " ✗ FAIL" -ForegroundColor Red
        Add-TestResult "API: Algorithm Status" "FAIL" "Algorithm status incorrect"
    }
} catch {
    Write-Host " ✗ FAIL ($($_.Exception.Message))" -ForegroundColor Red
    Add-TestResult "API: Algorithm Status" "FAIL" $_.Exception.Message
}

# 6. Performance Test
Print-Section "6. Performance Testing"

Write-Host "Measuring response time..." -NoNewline
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"topic": "Performance Test Topic"}' `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 5000) {
        Write-Host " ✓ PASS (${responseTime}ms)" -ForegroundColor Green
        Add-TestResult "Performance: Response Time" "PASS" "${responseTime}ms"
    } else {
        Write-Host " ✗ SLOW (${responseTime}ms)" -ForegroundColor Yellow
        Add-TestResult "Performance: Response Time" "WARN" "${responseTime}ms (slower than expected)"
    }
} catch {
    $stopwatch.Stop()
    Write-Host " ✗ FAIL" -ForegroundColor Red
    Add-TestResult "Performance: Response Time" "FAIL" $_.Exception.Message
}

# 7. Cleanup
Print-Section "7. Cleanup"

if (-not $serverWasRunning -and $serverJob) {
    Write-Host "Stopping test server..." -NoNewline
    Stop-Job $serverJob
    Remove-Job $serverJob
    Write-Host " ✓ Done" -ForegroundColor Green
}

# 8. Generate Report
Print-Section "8. Test Summary"

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count
$infoCount = ($testResults | Where-Object { $_.Status -eq "INFO" }).Count
$totalCount = $testResults.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor Cyan
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Warnings: $warnCount" -ForegroundColor Yellow
Write-Host "Info: $infoCount" -ForegroundColor Gray
Write-Host ""

# Display detailed results
Write-Host "Detailed Results:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
$testResults | Format-Table -AutoSize

# Save report to file
$reportPath = "test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$testResults | Format-Table -AutoSize | Out-File $reportPath
Write-Host "Report saved to: $reportPath" -ForegroundColor Cyan

# Exit with appropriate code
if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "❌ TESTS FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
    exit 0
}
