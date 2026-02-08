"""
Quick test script to verify SBERT service endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        print("✅ Health endpoint test passed!\n")
        return True
    except Exception as e:
        print(f"❌ Health endpoint test failed: {e}\n")
        return False

def test_embed():
    """Test the embed endpoint"""
    print("Testing /embed endpoint...")
    try:
        test_text = "This is a test sentence for embedding generation."
        payload = {"text": test_text}
        
        response = requests.post(
            f"{BASE_URL}/embed",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        
        print(f"Text: {data['text']}")
        print(f"Embedding dimension: {len(data['embedding'])}")
        print(f"First 5 values: {data['embedding'][:5]}")
        
        assert response.status_code == 200
        assert len(data['embedding']) == 384
        assert data['text'] == test_text
        print("✅ Embed endpoint test passed!\n")
        return True
    except Exception as e:
        print(f"❌ Embed endpoint test failed: {e}\n")
        return False

def test_embed_empty():
    """Test embed endpoint with empty text"""
    print("Testing /embed endpoint with empty text...")
    try:
        response = requests.post(
            f"{BASE_URL}/embed",
            json={"text": ""},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 400
        print("✅ Empty text validation test passed!\n")
        return True
    except Exception as e:
        print(f"❌ Empty text validation test failed: {e}\n")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("SBERT Service Quick Test Suite")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test health endpoint
    results.append(("Health Endpoint", test_health()))
    
    # Test embed endpoint
    results.append(("Embed Endpoint", test_embed()))
    
    # Test validation
    results.append(("Empty Text Validation", test_embed_empty()))
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
