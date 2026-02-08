"""
Test script for SBERT Service
Run this after starting the service to verify all endpoints work correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the /health endpoint"""
    print("\n=== Testing /health endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        print("✓ Health endpoint test passed!")
        return True
    except Exception as e:
        print(f"✗ Health endpoint test failed: {e}")
        return False

def test_embed_endpoint():
    """Test the /embed endpoint"""
    print("\n=== Testing /embed endpoint ===")
    
    test_cases = [
        {
            "name": "Simple text",
            "text": "Hello world"
        },
        {
            "name": "Longer text",
            "text": "This is a longer sentence to test the embedding generation with more context."
        },
        {
            "name": "Technical text",
            "text": "Machine learning models use neural networks to process natural language."
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\nTest: {test_case['name']}")
        print(f"Input: {test_case['text']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/embed",
                json={"text": test_case["text"]},
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                embedding = data.get("embedding", [])
                
                print(f"Embedding dimension: {len(embedding)}")
                print(f"First 5 values: {embedding[:5]}")
                print(f"Processing time: {data.get('processing_time_ms', 'N/A')} ms")
                
                # Verify embedding dimension
                assert len(embedding) == 384, f"Expected 384 dimensions, got {len(embedding)}"
                
                # Verify all values are floats
                assert all(isinstance(x, (int, float)) for x in embedding), "All values should be numeric"
                
                print(f"✓ Test '{test_case['name']}' passed!")
            else:
                print(f"✗ Test '{test_case['name']}' failed with status {response.status_code}")
                print(f"Response: {response.text}")
                all_passed = False
                
        except Exception as e:
            print(f"✗ Test '{test_case['name']}' failed: {e}")
            all_passed = False
    
    return all_passed

def test_error_handling():
    """Test error handling"""
    print("\n=== Testing Error Handling ===")
    
    # Test empty text
    print("\nTest: Empty text")
    try:
        response = requests.post(
            f"{BASE_URL}/embed",
            json={"text": ""},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 422:
            print("✓ Empty text validation works!")
        else:
            print("✗ Expected 422 status code for empty text")
            
    except Exception as e:
        print(f"✗ Error handling test failed: {e}")
    
    # Test missing text field
    print("\nTest: Missing text field")
    try:
        response = requests.post(
            f"{BASE_URL}/embed",
            json={},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 422:
            print("✓ Missing field validation works!")
        else:
            print("✗ Expected 422 status code for missing field")
            
    except Exception as e:
        print(f"✗ Error handling test failed: {e}")

def main():
    """Run all tests"""
    print("=" * 60)
    print("SBERT Service Test Suite")
    print("=" * 60)
    print(f"Testing service at: {BASE_URL}")
    
    try:
        # Test if service is running
        requests.get(BASE_URL, timeout=2)
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Service is not running!")
        print("Please start the service first:")
        print("  uvicorn app:app --reload --port 8000")
        return
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        return
    
    # Run tests
    health_passed = test_health_endpoint()
    embed_passed = test_embed_endpoint()
    test_error_handling()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"Health endpoint: {'✓ PASSED' if health_passed else '✗ FAILED'}")
    print(f"Embed endpoint: {'✓ PASSED' if embed_passed else '✗ FAILED'}")
    
    if health_passed and embed_passed:
        print("\n🎉 All critical tests passed!")
    else:
        print("\n⚠️  Some tests failed. Please check the output above.")

if __name__ == "__main__":
    main()
