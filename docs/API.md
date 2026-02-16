# API Documentation 🔌

Complete reference for the Topic Similarity API endpoints.

**Base URL:** `http://localhost:3000`  
**API Version:** v1.0.0  
**Content-Type:** `application/json`

---

## Table of Contents

- [Health Check](#health-check)
- [Topic Similarity Check](#topic-similarity-check)
- [Response Formats](#response-formats)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## Health Check

Verify the API server is running and healthy.

### Request

```http
GET /health
```

### Response (200 OK)

```json
{
  "status": "OK",
  "message": "Server is running",
  "environment": "development",
  "apiVersion": "1.0.0"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Server is healthy |
| 503 | Server unavailable |

### Example

```bash
curl http://localhost:3000/health
```

---

## Topic Similarity Check

Check a new topic for similarity against existing submissions.

### Request

```http
POST /api/similarity/check
Content-Type: application/json

{
  "topic": "Machine Learning Applications in Healthcare",
  "keywords": "neural networks, medical diagnosis, AI"
}
```

### Request Parameters

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| topic | string | Yes | 5-200 words | The research topic to check |
| keywords | string | No | max 500 chars | Comma-separated keywords |

### Response (200 OK)

```json
{
  "status": "success",
  "riskLevel": "HIGH",
  "maxSimilarity": 0.88,
  "algorithms": {
    "jaccard": {
      "score": 0.85,
      "topResults": [
        {
          "id": 123,
          "topic_title": "Deep Learning for Medical Image Analysis",
          "keywords": "CNN, medical imaging, diagnosis",
          "supervisor_name": "Dr. John Smith",
          "session_year": "2023",
          "status": "approved",
          "jaccard_score": 0.85
        },
        {
          "id": 124,
          "topic_title": "Neural Networks in Healthcare",
          "keywords": "deep learning, medical diagnosis",
          "supervisor_name": "Dr. Jane Doe",
          "session_year": "2023",
          "status": "approved",
          "jaccard_score": 0.78
        }
      ]
    },
    "tfidf": {
      "score": 0.82,
      "topResults": [
        {
          "id": 123,
          "topic_title": "Deep Learning for Medical Image Analysis",
          "tfidf_score": 0.82
        }
      ]
    },
    "sbert": {
      "score": 0.88,
      "topResults": [
        {
          "id": 123,
          "topic_title": "Deep Learning for Medical Image Analysis",
          "sbert_score": 0.88
        }
      ]
    }
  },
  "tier1_matches": [
    {
      "id": 123,
      "topic_title": "Deep Learning for Medical Image Analysis",
      "keywords": "CNN, medical imaging, diagnosis",
      "supervisor_name": "Dr. John Smith",
      "session_year": "2023",
      "status": "approved",
      "jaccard_score": 0.85,
      "tfidf_score": 0.82,
      "sbert_score": 0.88,
      "max_score": 0.88
    }
  ],
  "tier2_matches": [
    {
      "id": 456,
      "topic_title": "AI in Medical Diagnosis",
      "keywords": "machine learning, diagnosis",
      "supervisor_name": "Dr. Jane Doe",
      "session_year": "2024",
      "status": "pending",
      "student_id": "S12345",
      "jaccard_score": 0.72,
      "tfidf_score": 0.68,
      "sbert_score": 0.75,
      "max_score": 0.75
    }
  ],
  "tier3_matches": [],
  "warnings": []
}
```

### Response (400 Bad Request)

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Topic must be at least 5 words",
  "details": {
    "field": "topic",
    "reason": "too_short",
    "minimum": 5,
    "provided": 3
  }
}
```

### Status Codes

| Code | Meaning | Possible Causes |
|------|---------|-----------------|
| 200 | Success | Similarity check completed |
| 400 | Bad Request | Invalid topic, missing fields |
| 500 | Server Error | Database error, unexpected condition |
| 503 | Service Unavailable | SBERT timeout (returns degraded response) |

### Risk Level Explanation

| Level | Condition | Action |
|-------|-----------|--------|
| LOW ✅ | MAX(scores) < 50% | Approve submission |
| MEDIUM ⚠️ | 50% ≤ MAX(scores) < 70% OR Tier2 matches exist | Manual review required |
| HIGH 🛑 | MAX(scores) ≥ 70% OR Tier3 matches exist | Likely duplicate, reject |

---

## Response Formats

### Success Response

```typescript
interface SuccessResponse {
  status: "success" | "degraded";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  maxSimilarity: number;
  
  algorithms: {
    jaccard: AlgorithmResult;
    tfidf: AlgorithmResult;
    sbert?: AlgorithmResult; // May be missing if service unavailable
  };
  
  tier1_matches: TopicMatch[];      // Top 5 historical submissions
  tier2_matches: TopicMatch[];      // Current session >= 60%
  tier3_matches: TopicMatch[];      // Under review >= 60%
  
  warnings: string[];               // ["SBERT service unavailable"]
}
```

### Algorithm Result

```typescript
interface AlgorithmResult {
  score: number;                    // 0-1 range
  topResults: TopicMatch[];         // Top 5 matches
}
```

### Topic Match

```typescript
interface TopicMatch {
  id: number;
  topic_title: string;
  keywords?: string;
  supervisor_name?: string;
  session_year?: string;
  status?: string;
  student_id?: string;              // Only for current_session_topics
  jaccard_score?: number;
  tfidf_score?: number;
  sbert_score?: number;
  max_score?: number;               // Maximum of the three scores
}
```

### Error Response

```typescript
interface ErrorResponse {
  status: "error";
  code: string;                     // Error code identifier
  message: string;                  // User-friendly message
  details?: {
    [key: string]: any;             // Additional error context
  };
}
```

---

## Error Codes

### 400 Bad Request

| Code | Message | Solution |
|------|---------|----------|
| VALIDATION_ERROR | Topic must be at least 5 words | Provide topic with 5+ words |
| TOPIC_REQUIRED | Topic field is required | Add topic field to request |
| TOPIC_TOO_LONG | Topic exceeds maximum length | Reduce topic to <200 words |
| KEYWORDS_TOO_LONG | Keywords exceed 500 characters | Reduce keywords length |
| INVALID_FORMAT | Request body must be valid JSON | Check JSON syntax |

### 500 Internal Server Error

| Code | Message | Action |
|------|---------|--------|
| DB_CONNECTION_ERROR | Database connection failed | Check PostgreSQL is running |
| DB_QUERY_TIMEOUT | Database query exceeded timeout | Try again, contact support |
| UNEXPECTED_ERROR | An unexpected error occurred | Check server logs |

### 503 Service Unavailable

| Code | Message | Action |
|------|---------|--------|
| SBERT_TIMEOUT | SBERT service exceeded timeout | Continues with 2 algorithms |

---

## Rate Limiting

### Limits

- **100 requests per 15 minutes per IP address**
- **1000 requests per hour per IP address** (for long-term limits)

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1645000000
```

### Rate Limit Exceeded (429)

```json
{
  "status": "error",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests, please try again later",
  "details": {
    "retryAfter": 120
  }
}
```

---

## Examples

### Example 1: Successful Check (High Risk)

**Request:**
```bash
curl -X POST http://localhost:3000/api/similarity/check \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Machine Learning Applications in Healthcare Diagnostics",
    "keywords": "neural networks, medical diagnosis, artificial intelligence"
  }'
```

**Response:**
```json
{
  "status": "success",
  "riskLevel": "HIGH",
  "maxSimilarity": 0.88,
  "algorithms": {
    "jaccard": {
      "score": 0.85,
      "topResults": [...]
    },
    "tfidf": {
      "score": 0.82,
      "topResults": [...]
    },
    "sbert": {
      "score": 0.88,
      "topResults": [...]
    }
  },
  "tier1_matches": [...],
  "tier2_matches": [...],
  "tier3_matches": [],
  "warnings": []
}
```

**Action:** Reject submission - likely duplicate (88% similarity match)

---

### Example 2: Valid Input (Low Risk)

**Request:**
```bash
curl -X POST http://localhost:3000/api/similarity/check \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Quantum Computing Applications in Cryptography and Security",
    "keywords": "quantum algorithms, encryption, post-quantum"
  }'
```

**Response:**
```json
{
  "status": "success",
  "riskLevel": "LOW",
  "maxSimilarity": 0.42,
  "algorithms": {
    "jaccard": { "score": 0.35, "topResults": [...] },
    "tfidf": { "score": 0.38, "topResults": [...] },
    "sbert": { "score": 0.42, "topResults": [...] }
  },
  "tier1_matches": [...],
  "tier2_matches": [],
  "tier3_matches": [],
  "warnings": []
}
```

**Action:** Approve submission - low similarity risk

---

### Example 3: Validation Error

**Request:**
```bash
curl -X POST http://localhost:3000/api/similarity/check \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Too short"
  }'
```

**Response:**
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Topic must be at least 5 words",
  "details": {
    "field": "topic",
    "reason": "too_short",
    "minimum": 5,
    "provided": 2
  }
}
```

**Action:** Ask user to provide longer topic

---

### Example 4: SBERT Service Unavailable (Degraded)

**Request:**
```bash
curl -X POST http://localhost:3000/api/similarity/check \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Machine Learning Applications in Healthcare"
  }'
```

**Response (SBERT timeout):**
```json
{
  "status": "degraded",
  "riskLevel": "MEDIUM",
  "maxSimilarity": 0.83,
  "algorithms": {
    "jaccard": {
      "score": 0.85,
      "topResults": [...]
    },
    "tfidf": {
      "score": 0.82,
      "topResults": [...]
    }
  },
  "tier1_matches": [...],
  "tier2_matches": [...],
  "tier3_matches": [],
  "warnings": [
    "SBERT service unavailable, results based on Jaccard and TF-IDF algorithms only"
  ]
}
```

**Action:** Show warning but continue with 2-algorithm result

---

## Request/Response Times

### Typical Performance

| Operation | Time | Conditions |
|-----------|------|-----------|
| Health check | <10ms | Direct response |
| Similarity check (2 algorithms) | 500-1000ms | No SBERT |
| Similarity check (3 algorithms) | 2000-5000ms | With SBERT |
| Database query (100k rows) | <500ms | With vector index |

### Timeout Values

| Resource | Timeout | Action on Timeout |
|----------|---------|-------------------|
| SBERT service | 5 seconds | Returns degraded response |
| Database query | 10 seconds | Returns 500 error |
| HTTP request | 30 seconds | Client-side timeout |

---

## Best Practices

### Input Validation

Always validate on the client side before sending:
```javascript
const topic = "Machine Learning in Healthcare";
const wordCount = topic.trim().split(/\s+/).length;

if (wordCount < 5 || wordCount > 200) {
  // Show error to user
}
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/similarity/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, keywords })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error (${error.code}): ${error.message}`);
  }

  const data = await response.json();
  
  if (data.status === 'degraded') {
    console.warn('Warning:', data.warnings[0]);
  }
  
  return data;
} catch (err) {
  console.error('Network error:', err);
}
```

### Retry Strategy

For production implementations:
1. First attempt: wait for full timeout (5s)
2. If fails, return degraded response (2 algorithms)
3. Log error for monitoring
4. Notify user via warning message

---

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const checkSimilarity = async (topic, keywords) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/similarity/check',
      { topic, keywords },
      { timeout: 30000 }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`API Error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('No response from server');
    } else {
      console.error('Request error:', error.message);
    }
    throw error;
  }
};
```

### Python

```python
import requests

def check_similarity(topic: str, keywords: str = None) -> dict:
    url = "http://localhost:3000/api/similarity/check"
    payload = {"topic": topic}
    
    if keywords:
        payload["keywords"] = keywords
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error: {e}")
        raise
```

### cURL

```bash
curl -X POST http://localhost:3000/api/similarity/check \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Your topic here",
    "keywords": "keyword1, keyword2"
  }'
```

---

**Last Updated:** February 16, 2026  
**API Version:** v1.0.0  
**Status:** ✅ Stable
