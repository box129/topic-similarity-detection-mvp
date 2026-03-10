#!/usr/bin/env python
"""
Integration tests for SBERT service
Tests all endpoints and scenarios required for backend integration
"""

import requests
import json
import time
from typing import Dict, List

BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name: str, passed: bool, details: str = ""):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status} | {name}")
    if details:
        print(f"  → {details}")

def test_health() -> bool:
    """Test health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        passed = response.status_code == 200
        data = response.json()
        details = f"Status: {data.get('status')}, Model: {data.get('model')}"
        print_test("Health Check", passed, details)
        return passed
    except Exception as e:
        print_test("Health Check", False, str(e))
        return False

def test_embed_single_text() -> bool:
    """Test embedding generation for single text"""
    try:
        payload = {"text": "Machine learning is a subset of artificial intelligence"}
        response = requests.post(f"{BASE_URL}/embed", json=payload)
        passed = response.status_code == 200
        data = response.json()
        
        if passed:
            embedding = data.get('embedding', [])
            dimension = data.get('dimension', 0)
            details = f"Embedding dimension: {dimension}, First 3 values: {embedding[:3]}"
            print_test("Single Text Embedding", dimension == 384, details)
            return dimension == 384
        else:
            print_test("Single Text Embedding", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_test("Single Text Embedding", False, str(e))
        return False

def test_embed_short_text() -> bool:
    """Test embedding generation for very short text"""
    try:
        payload = {"text": "AI"}
        response = requests.post(f"{BASE_URL}/embed", json=payload)
        passed = response.status_code == 200 and response.json().get('dimension') == 384
        details = f"Status: {response.status_code}"
        print_test("Short Text Embedding", passed, details)
        return passed
    except Exception as e:
        print_test("Short Text Embedding", False, str(e))
        return False

def test_embed_long_text() -> bool:
    """Test embedding generation for very long text"""
    try:
        long_text = " ".join(["Machine learning"] * 500)  # 1000 words
        payload = {"text": long_text}
        response = requests.post(f"{BASE_URL}/embed", json=payload)
        passed = response.status_code == 200 and response.json().get('dimension') == 384
        details = f"Text length: {len(long_text)} chars"
        print_test("Long Text Embedding", passed, details)
        return passed
    except Exception as e:
        print_test("Long Text Embedding", False, str(e))
        return False

def test_embed_empty_text() -> bool:
    """Test embedding generation with empty text (should fail)"""
    try:
        payload = {"text": ""}
        response = requests.post(f"{BASE_URL}/embed", json=payload)
        passed = response.status_code == 400
        details = f"Status: {response.status_code} (expected 400)"
        print_test("Empty Text Rejection", passed, details)
        return passed
    except Exception as e:
        print_test("Empty Text Rejection", False, str(e))
        return False

def test_embed_whitespace_only() -> bool:
    """Test embedding generation with whitespace only (should fail)"""
    try:
        payload = {"text": "   \n\t  "}
        response = requests.post(f"{BASE_URL}/embed", json=payload)
        passed = response.status_code == 400
        details = f"Status: {response.status_code} (expected 400)"
        print_test("Whitespace-Only Text Rejection", passed, details)
        return passed
    except Exception as e:
        print_test("Whitespace-Only Text Rejection", False, str(e))
        return False

def test_embed_consistency() -> bool:
    """Test that same text produces same embedding (deterministic)"""
    try:
        payload = {"text": "Test deterministic embeddings"}
        response1 = requests.post(f"{BASE_URL}/embed", json=payload)
        response2 = requests.post(f"{BASE_URL}/embed", json=payload)
        
        if response1.status_code == 200 and response2.status_code == 200:
            emb1 = response1.json()['embedding']
            emb2 = response2.json()['embedding']
            passed = emb1 == emb2
            details = f"Embeddings match: {passed}"
            print_test("Deterministic Embedding", passed, details)
            return passed
        else:
            print_test("Deterministic Embedding", False, "Request failed")
            return False
    except Exception as e:
        print_test("Deterministic Embedding", False, str(e))
        return False

def test_embed_different_texts() -> bool:
    """Test that different texts produce different embeddings"""
    try:
        texts = ["Hello world", "Goodbye world"]
        embeddings = []
        
        for text in texts:
            payload = {"text": text}
            response = requests.post(f"{BASE_URL}/embed", json=payload)
            if response.status_code == 200:
                embeddings.append(response.json()['embedding'])
            else:
                print_test("Different Text Embeddings", False, "Request failed")
                return False
        
        passed = embeddings[0] != embeddings[1]
        details = f"Embeddings differ: {passed}"
        print_test("Different Text Embeddings", passed, details)
        return passed
    except Exception as e:
        print_test("Different Text Embeddings", False, str(e))
        return False

def test_root_endpoint() -> bool:
    """Test root endpoint information"""
    try:
        response = requests.get(f"{BASE_URL}/")
        passed = response.status_code == 200
        data = response.json()
        details = f"Service: {data.get('service')}, Version: {data.get('version')}"
        print_test("Root Endpoint", passed, details)
        return passed
    except Exception as e:
        print_test("Root Endpoint", False, str(e))
        return False

def test_batch_embeddings() -> bool:
    """Test multiple sequential embedding requests (simulating batch)"""
    try:
        texts = [
            "Artificial intelligence",
            "Machine learning",
            "Deep learning",
            "Natural language processing",
            "Computer vision"
        ]
        
        all_passed = True
        embeddings = []
        
        for text in texts:
            payload = {"text": text}
            response = requests.post(f"{BASE_URL}/embed", json=payload)
            if response.status_code == 200:
                embeddings.append(response.json()['embedding'])
            else:
                all_passed = False
                break
        
        details = f"Successfully embedded {len(embeddings)} texts"
        print_test("Batch Embeddings", all_passed and len(embeddings) == 5, details)
        return all_passed and len(embeddings) == 5
    except Exception as e:
        print_test("Batch Embeddings", False, str(e))
        return False

def test_concurrent_requests() -> bool:
    """Test multiple concurrent requests"""
    try:
        import concurrent.futures
        
        texts = ["Test " + str(i) for i in range(5)]
        
        def embed_text(text):
            payload = {"text": text}
            return requests.post(f"{BASE_URL}/embed", json=payload)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(embed_text, text) for text in texts]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        passed = all(r.status_code == 200 for r in results)
        details = f"Successfully processed {sum(1 for r in results if r.status_code == 200)}/5 concurrent requests"
        print_test("Concurrent Requests", passed, details)
        return passed
    except Exception as e:
        print_test("Concurrent Requests", False, str(e))
        return False

def run_all_tests():
    """Run all tests"""
    print(f"\n{Colors.BLUE}=== SBERT Service Integration Tests ==={Colors.END}\n")
    
    tests = [
        test_health,
        test_root_endpoint,
        test_embed_single_text,
        test_embed_short_text,
        test_embed_long_text,
        test_embed_empty_text,
        test_embed_whitespace_only,
        test_embed_consistency,
        test_embed_different_texts,
        test_batch_embeddings,
        test_concurrent_requests,
    ]
    
    results = []
    for test_func in tests:
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"{Colors.RED}✗ FAIL{Colors.END} | {test_func.__name__} - Critical error: {str(e)}")
            results.append(False)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n{Colors.BLUE}=== Test Summary ==={Colors.END}")
    print(f"Passed: {Colors.GREEN}{passed}/{total}{Colors.END}")
    
    if passed == total:
        print(f"{Colors.GREEN}✓ All tests passed!{Colors.END}\n")
    else:
        print(f"{Colors.YELLOW}⚠ {total - passed} test(s) failed{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    # Wait for service to be ready
    print(f"{Colors.YELLOW}Waiting for SBERT service to be ready...{Colors.END}")
    max_retries = 5
    for i in range(max_retries):
        try:
            requests.get(f"{BASE_URL}/health", timeout=2)
            print(f"{Colors.GREEN}Service is ready!{Colors.END}\n")
            break
        except:
            if i < max_retries - 1:
                time.sleep(2)
            else:
                print(f"{Colors.RED}Could not connect to service at {BASE_URL}{Colors.END}")
                exit(1)
    
    success = run_all_tests()
    exit(0 if success else 1)
