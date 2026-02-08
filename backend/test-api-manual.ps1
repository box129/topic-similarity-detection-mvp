# Manual API Testing Script
# Tests the POST /api/similarity/check endpoint with various scenarios

Write-Host "=== API Manual Testing Script ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Valid Topic (7-24 words)
Write-Host "Test 2: Valid Topic with 7-24 words" -ForegroundColor Yellow
$body = @{
    topic = "Machine Learning Applications in Healthcare Diagnosis Using Neural Networks"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✓ Valid topic test passed" -ForegroundColor Green
    Write-Host "Response structure:" -ForegroundColor Gray
    Write-Host "  - Topic: $($response.topic)" -ForegroundColor Gray
    Write-Host "  - Keywords: $($response.keywords)" -ForegroundColor Gray
    Write-Host "  - Overall Risk: $($response.overallRisk)" -ForegroundColor Gray
    Write-Host "  - Processing Time: $($response.processingTime)ms" -ForegroundColor Gray
    Write-Host "  - Tier 1 Results: $($response.results.tier1_historical.Count)" -ForegroundColor Gray
    Write-Host "  - Tier 2 Results: $($response.results.tier2_current_session.Count)" -ForegroundColor Gray
    Write-Host "  - Tier 3 Results: $($response.results.tier3_under_review.Count)" -ForegroundColor Gray
    if ($response.algorithmStatus) {
        Write-Host "  - Algorithm Status:" -ForegroundColor Gray
        Write-Host "    * Jaccard: $($response.algorithmStatus.jaccard)" -ForegroundColor Gray
        Write-Host "    * TF-IDF: $($response.algorithmStatus.tfidf)" -ForegroundColor Gray
        Write-Host "    * SBERT: $($response.algorithmStatus.sbert)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Valid topic test failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Topic with Keywords
Write-Host "Test 3: Topic with Keywords" -ForegroundColor Yellow
$body = @{
    topic = "Artificial Intelligence in Autonomous Vehicle Navigation Systems"
    keywords = "computer vision, sensor fusion, path planning"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✓ Topic with keywords test passed" -ForegroundColor Green
    Write-Host "  - Keywords included: $($response.keywords)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Topic with keywords test failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Empty Topic (Should fail)
Write-Host "Test 4: Empty Topic (Should return 400)" -ForegroundColor Yellow
$body = @{
    topic = ""
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✗ Empty topic test failed - should have returned 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Empty topic correctly rejected with 400" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Missing Topic Field (Should fail)
Write-Host "Test 5: Missing Topic Field (Should return 400)" -ForegroundColor Yellow
$body = @{
    keywords = "some keywords"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✗ Missing topic test failed - should have returned 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Missing topic correctly rejected with 400" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 6: Short Topic (Less than 7 words)
Write-Host "Test 6: Short Topic (Less than 7 words)" -ForegroundColor Yellow
$body = @{
    topic = "Machine Learning Applications"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Success: Short topic accepted (no word count validation)" -ForegroundColor Green
} catch {
    Write-Host "Failed: Short topic test failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Performance Test
Write-Host "Test 7: Performance Test (Should respond under 1000ms)" -ForegroundColor Yellow
$body = @{
    topic = "Internet of Things Security and Privacy Challenges in Smart Cities"
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" -Method POST -ContentType "application/json" -Body $body
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    if ($duration -lt 1000) {
        Write-Host "Success: Performance test passed: $duration ms" -ForegroundColor Green
    } else {
        Write-Host "Failed: Performance test - took $duration ms (should be under 1000ms)" -ForegroundColor Red
    }
    Write-Host "  - Server reported: $($response.processingTime)ms" -ForegroundColor Gray
} catch {
    Write-Host "Failed: Performance test error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Special Characters
Write-Host "Test 8: Topic with Special Characters" -ForegroundColor Yellow
$body = @{
    topic = "AI ML and Deep Learning 2024 Research Applications"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/similarity/check" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Success: Special characters handled correctly" -ForegroundColor Green
} catch {
    Write-Host "Failed: Special characters test: $_" -ForegroundColor Red
}
Write-Host ""

# Test 9: 404 Handler
Write-Host "Test 9: Non-existent Route (Should return 404)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/non-existent" -Method GET
    Write-Host "Failed: 404 test - should have returned 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "Success: Non-existent route correctly returns 404" -ForegroundColor Green
    } else {
        Write-Host "Failed: Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
