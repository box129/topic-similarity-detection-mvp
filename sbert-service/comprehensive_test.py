"""
Comprehensive Test Suite for SBERT Service
Tests all endpoints, error handling, and edge cases
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
HEALTH_ENDPOINT = f"{BASE_URL}/health"
EMBED_ENDPOINT = f"{BASE_URL}/embed"

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(test_name: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   Details: {details}")
    
    test_results["tests"].append({
        "name": test_name,
        "passed": passed,
        "details": details
    })
    
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

def test_health_endpoint():
    """Test 1: Health Endpoint - Verify service is running"""
    print("\n" + "="*60)
    print("TEST 1: Health Endpoint")
    print("="*60)
    
    try:
        response = requests.get(HEALTH_ENDPOINT, timeout=5)
        
        # Check status code
        if response.status_code == 200:
            log_test("Health endpoint returns 200", True)
        else:
            log_test("Health endpoint returns 200", False, f"Got {response.status_code}")
            return
        
        # Check response structure
        data = response.json()
        
        if "status" in data and data["status"] == "healthy":
            log_test("Health status is 'healthy'", True)
        else:
            log_test("Health status is 'healthy'", False, f"Got {data.get('status')}")
        
        if "model" in data:
            log_test("Model name is present", True, f"Model: {data['model']}")
        else:
            log_test("Model name is present", False)
        
        # Verify model name
        expected_model = "sentence-transformers/all-MiniLM-L6-v2"
        if data.get("model") == expected_model:
            log_test("Correct model name", True)
        else:
            log_test("Correct model name", False, f"Expected {expected_model}, got {data.get('model')}")
            
    except requests.exceptions.ConnectionError:
        log_test("Health endpoint accessible", False, "Connection refused - is the server running?")
    except Exception as e:
        log_test("Health endpoint test", False, str(e))

def test_embed_valid_text():
    """Test 2: Embed Endpoint - Valid text input"""
    print("\n" + "="*60)
    print("TEST 2: Embed Endpoint - Valid Text")
    print("="*60)
    
    test_cases = [
        ("Short text", "Hello world"),
        ("Medium text", "This is a medium length sentence for testing the embedding generation."),
        ("Long text", "This is a much longer text that contains multiple sentences. It is designed to test how the model handles longer inputs. The embedding should still be 384 dimensions regardless of the input length. This helps us verify that the model is working correctly with various text lengths.")
    ]
    
    for test_name, text in test_cases:
        try:
            start_time = time.time()
            response = requests.post(
                EMBED_ENDPOINT,
                json={"text": text},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            processing_time = time.time() - start_time
            
            # Check status code
            if response.status_code == 200:
                log_test(f"{test_name}: Status 200", True)
            else:
                log_test(f"{test_name}: Status 200", False, f"Got {response.status_code}")
                continue
            
            data = response.json()
            
            # Check embedding presence
            if "embedding" in data:
                log_test(f"{test_name}: Embedding present", True)
            else:
                log_test(f"{test_name}: Embedding present", False)
                continue
            
            # Check embedding dimensions
            embedding = data["embedding"]
            if len(embedding) == 384:
                log_test(f"{test_name}: 384 dimensions", True)
            else:
                log_test(f"{test_name}: 384 dimensions", False, f"Got {len(embedding)} dimensions")
            
            # Check all values are numeric
            if all(isinstance(x, (int, float)) for x in embedding):
                log_test(f"{test_name}: All values numeric", True)
            else:
                log_test(f"{test_name}: All values numeric", False)
            
            # Check processing time is tracked
            if "processing_time" in data:
                log_test(f"{test_name}: Processing time tracked", True, f"{data['processing_time']:.4f}s (actual: {processing_time:.4f}s)")
            else:
                log_test(f"{test_name}: Processing time tracked", False)
            
            # Check text length
            if "text_length" in data:
                log_test(f"{test_name}: Text length tracked", True, f"{data['text_length']} chars")
            else:
                log_test(f"{test_name}: Text length tracked", False)
                
        except Exception as e:
            log_test(f"{test_name}: Test execution", False, str(e))

def test_embed_error_handling():
    """Test 3: Error Handling"""
    print("\n" + "="*60)
    print("TEST 3: Error Handling")
    print("="*60)
    
    # Test 3.1: Empty text
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            json={"text": ""},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 422:
            log_test("Empty text returns 422", True)
        else:
            log_test("Empty text returns 422", False, f"Got {response.status_code}")
    except Exception as e:
        log_test("Empty text test", False, str(e))
    
    # Test 3.2: Missing text field
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            json={},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 422:
            log_test("Missing text field returns 422", True)
        else:
            log_test("Missing text field returns 422", False, f"Got {response.status_code}")
    except Exception as e:
        log_test("Missing text field test", False, str(e))
    
    # Test 3.3: Invalid JSON
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            data="invalid json",
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 422:
            log_test("Invalid JSON returns 422", True)
        else:
            log_test("Invalid JSON returns 422", False, f"Got {response.status_code}")
    except Exception as e:
        log_test("Invalid JSON test", False, str(e))
    
    # Test 3.4: Wrong data type for text
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            json={"text": 12345},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 422:
            log_test("Wrong data type returns 422", True)
        else:
            log_test("Wrong data type returns 422", False, f"Got {response.status_code}")
    except Exception as e:
        log_test("Wrong data type test", False, str(e))

def test_edge_cases():
    """Test 4: Edge Cases"""
    print("\n" + "="*60)
    print("TEST 4: Edge Cases")
    print("="*60)
    
    # Test 4.1: Very long text (>256 tokens)
    very_long_text = " ".join(["word"] * 500)  # ~500 words
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            json={"text": very_long_text},
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if len(data.get("embedding", [])) == 384:
                log_test("Very long text (500 words)", True, "Embedding generated successfully")
            else:
                log_test("Very long text (500 words)", False, "Invalid embedding dimensions")
        else:
            log_test("Very long text (500 words)", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("Very long text test", False, str(e))
    
    # Test 4.2: Special characters
    special_text = "Hello! @#$%^&*() 你好 مرحبا Привет 🚀🎉"
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            json={"text": special_text},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if len(data.get("embedding", [])) == 384:
                log_test("Special characters & Unicode", True)
            else:
                log_test("Special characters & Unicode", False, "Invalid embedding dimensions")
        else:
            log_test("Special characters & Unicode", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("Special characters test", False, str(e))
    
    # Test 4.3: Whitespace only
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            json={"text": "   "},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        # Should either return 422 or handle gracefully with 200
        if response.status_code in [200, 422]:
            log_test("Whitespace-only text", True, f"Status: {response.status_code}")
        else:
            log_test("Whitespace-only text", False, f"Unexpected status {response.status_code}")
    except Exception as e:
        log_test("Whitespace-only test", False, str(e))
    
    # Test 4.4: Single character
    try:
        response = requests.post(
            EMBED_ENDPOINT,
            json={"text": "a"},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if len(data.get("embedding", [])) == 384:
                log_test("Single character", True)
            else:
                log_test("Single character", False, "Invalid embedding dimensions")
        else:
            log_test("Single character", False, f"Got status {response.status_code}")
    except Exception as e:
        log_test("Single character test", False, str(e))

def test_multiple_requests():
    """Test 5: Multiple Consecutive Requests"""
    print("\n" + "="*60)
    print("TEST 5: Multiple Consecutive Requests")
    print("="*60)
    
    num_requests = 5
    successful_requests = 0
    
    try:
        for i in range(num_requests):
            response = requests.post(
                EMBED_ENDPOINT,
                json={"text": f"Test request number {i+1}"},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if len(data.get("embedding", [])) == 384:
                    successful_requests += 1
        
        if successful_requests == num_requests:
            log_test(f"Multiple requests ({num_requests})", True, f"All {num_requests} requests successful")
        else:
            log_test(f"Multiple requests ({num_requests})", False, f"Only {successful_requests}/{num_requests} successful")
            
    except Exception as e:
        log_test("Multiple requests test", False, str(e))

def test_cors_headers():
    """Test 6: CORS Headers"""
    print("\n" + "="*60)
    print("TEST 6: CORS Headers")
    print("="*60)
    
    try:
        response = requests.options(
            EMBED_ENDPOINT,
            headers={"Origin": "http://localhost:3000"},
            timeout=5
        )
        
        # Check for CORS headers
        cors_headers = {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, POST, OPTIONS",
            "access-control-allow-headers": "*"
        }
        
        headers_present = True
        for header, expected_value in cors_headers.items():
            if header in response.headers:
                log_test(f"CORS header '{header}' present", True, f"Value: {response.headers[header]}")
            else:
                log_test(f"CORS header '{header}' present", False)
                headers_present = False
        
        if headers_present:
            log_test("All CORS headers configured", True)
        else:
            log_test("All CORS headers configured", False)
            
    except Exception as e:
        log_test("CORS headers test", False, str(e))

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    total_tests = test_results["passed"] + test_results["failed"]
    pass_rate = (test_results["passed"] / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {test_results['passed']} ✅")
    print(f"Failed: {test_results['failed']} ❌")
    print(f"Pass Rate: {pass_rate:.1f}%")
    
    if test_results["failed"] > 0:
        print("\n" + "="*60)
        print("FAILED TESTS:")
        print("="*60)
        for test in test_results["tests"]:
            if not test["passed"]:
                print(f"❌ {test['name']}")
                if test["details"]:
                    print(f"   {test['details']}")
    
    print("\n" + "="*60)
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    print("Detailed results saved to: test_results.json")

def main():
    """Run all tests"""
    print("="*60)
    print("SBERT SERVICE - COMPREHENSIVE TEST SUITE")
    print("="*60)
    print(f"Target: {BASE_URL}")
    print("="*60)
    
    # Run all test suites
    test_health_endpoint()
    test_embed_valid_text()
    test_embed_error_handling()
    test_edge_cases()
    test_multiple_requests()
    test_cors_headers()
    
    # Print summary
    print_summary()
    
    # Return exit code based on results
    return 0 if test_results["failed"] == 0 else 1

if __name__ == "__main__":
    exit(main())
