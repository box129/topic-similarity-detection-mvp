# Topic Similarity API Documentation

## Overview

The Topic Similarity API provides endpoints for checking similarity between a new topic and existing topics in the database using three different algorithms: Jaccard similarity, TF-IDF, and SBERT (Sentence-BERT).

**Base URL:** `http://localhost:3000`  
**API Version:** v1.0.0

---

## Endpoints

### 1. Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "environment": "development",
  "apiVersion": "1.0.0"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

### 2. Check Topic Similarity

Check similarity between a new topic and existing topics in the database.

**Endpoint:** `POST /api/similarity/check`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "topic": "Machine Learning Applications in Healthcare",
  "keywords": "neural networks, medical diagnosis, AI"
}
```

**Parameters:**

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| topic     | string | Yes      | The topic title to check for similarity        |
| keywords  | string | No       | Optional keywords associated with the topic    |

**Response:**
```json
{
  "topic": "Machine Learning Applications in Healthcare",
  "keywords": "neural networks, medical diagnosis, AI",
  "results": {
    "tier1_historical": [
      {
        "id": 123,
        "title": "Deep Learning for Medical Image Analysis",
        "keywords": "CNN, medical imaging, diagnosis",
        "sessionYear": "2023",
        "supervisorName": "Dr. John Smith",
        "category": "Artificial Intelligence",
        "scores": {
          "jaccard": 0.756,
          "tfidf": 0.823,
          "sbert": 0.891,
          "combined": 0.834
        },
        "matchedKeywords": ["learn", "medic", "neural"],
        "matchedTerms": ["learning", "medical", "neural", "networks"]
      }
    ],
    "tier2_current_session": [
      {
        "id": 456,
        "title": "AI in Healthcare Diagnostics",
        "keywords": "machine learning, diagnosis",
        "sessionYear": "2024",
        "supervisorName": "Dr. Jane Doe",
        "category": "Artificial Intelligence",
        "studentId": "S12345",
        "scores": {
          "jaccard": 0.678,
          "tfidf": 0.712,
          "sbert": 0.845,
          "combined": 0.756
        },
        "matchedKeywords": ["healthcar", "diagnos"],
        "matchedTerms": ["healthcare", "diagnosis", "AI"]
      }
    ],
    "tier3_under_review": []
  },
  "overallRisk": "HIGH",
  "algorithmStatus": {
    "jaccard": true,
    "tfidf": true,
    "sbert": true
  },
  "processingTime": 1234
}
```

**Response Fields:**

| Field                          | Type    | Description                                                      |
|--------------------------------|---------|------------------------------------------------------------------|
| topic                          | string  | The input topic title                                            |
| keywords                       | string  | The input keywords (null if not provided)                        |
| results                        | object  | Contains three tiers of similar topics                           |
| results.tier1_historical       | array   | Top 5 most similar historical topics                             |
| results.tier2_current_session  | array   | Current session topics with combined score ≥ 0.60                |
| results.tier3_under_review     | array   | Under review topics (last 48h) with combined score ≥ 0.60        |
| overallRisk                    | string  | Risk level: "LOW", "MEDIUM", or "HIGH"                           |
| algorithmStatus                | object  | Status of each algorithm (true if successful)                    |
| processingTime                 | number  | Total processing time in milliseconds                            |

**Topic Object Fields:**

| Field            | Type   | Description                                    |
|------------------|--------|------------------------------------------------|
| id               | number | Topic ID                                       |
| title            | string | Topic title                                    |
| keywords         | string | Topic keywords                                 |
| sessionYear      | string | Academic session year                          |
| supervisorName   | string | Supervisor's name                              |
| category         | string | Topic category                                 |
| studentId        | string | Student ID (tier 2 only)                       |
| reviewingLecturer| string | Reviewing lecturer (tier 3 only)               |
| reviewStartedAt  | string | Review start timestamp (tier 3 only)           |
| scores           | object | Similarity scores from all algorithms          |
| matchedKeywords  | array  | Keywords matched by Jaccard algorithm          |
| matchedTerms     | array  | Terms matched by TF-IDF algorithm              |

**Similarity Scores:**

| Score    | Range | Description                                           |
|----------|-------|-------------------------------------------------------|
| jaccard  | 0-1   | Jaccard similarity (set-based overlap)                |
| tfidf    | 0-1   | TF-IDF cosine similarity (term frequency)             |
| sbert    | 0-1   | SBERT cosine similarity (semantic embeddings)         |
| combined | 0-1   | Weighted average (30% Jaccard, 30% TF-IDF, 40% SBERT) |

**Risk Levels:**

| Risk   | Conditions                                                                  |
|--------|-----------------------------------------------------------------------------|
| HIGH   | - Any tier 2 or tier 3 matches exist, OR                                   |
|        | - Tier 1 top match has combined score ≥ 0.80                               |
| MEDIUM | - Tier 1 top match has combined score ≥ 0.60 (and < 0.80)                  |
| LOW    | - All other cases                                                           |

**Status Codes:**
- `200 OK` - Similarity check completed successfully
- `400 Bad Request` - Invalid input (missing or empty topic)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error during processing

**Error Response Format:**

All errors follow this standardized format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...},  // Optional, only for validation errors
    "stack": "..."     // Only in development mode
  }
}
```

**Example Error Responses:**

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "topic": "Topic is required and cannot be empty"
    }
  }
}
```

**Missing Topic (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Topic is required and must be a non-empty string"
  }
}
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

**Database Error (500 - Production):**
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "A database error occurred. Please try again later."
  }
}
```

**Internal Server Error (500 - Development):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "TypeError: Cannot read property 'x' of undefined",
    "stack": "TypeError: Cannot read property 'x' of undefined\n    at ..."
  }
}
```

For a complete list of error codes and handling guidelines, see [ERROR-CODE-REFERENCE.md](./ERROR-CODE-REFERENCE.md).

---

## Algorithm Details

### 1. Jaccard Similarity

**Description:** Measures overlap between two sets of words.

**Formula:** `|A ∩ B| / |A ∪ B|`

**Process:**
1. Tokenize and stem both texts
2. Create sets of unique stemmed tokens
3. Calculate intersection and union
4. Return ratio

**Weight in Combined Score:** 30%

**Example:**
- Text 1: "machine learning algorithms"
- Text 2: "deep learning and machine learning"
- Stemmed tokens 1: {machin, learn, algorithm}
- Stemmed tokens 2: {deep, learn, machin}
- Intersection: {machin, learn}
- Union: {machin, learn, algorithm, deep}
- Score: 2/4 = 0.500

### 2. TF-IDF Similarity

**Description:** Measures similarity based on term frequency and inverse document frequency.

**Process:**
1. Calculate TF-IDF vectors for query and all topics
2. Compute cosine similarity between vectors
3. Return similarity score

**Weight in Combined Score:** 30%

**Advantages:**
- Considers term importance across documents
- Reduces weight of common words
- Better for longer texts

### 3. SBERT (Sentence-BERT)

**Description:** Uses pre-trained neural network to generate semantic embeddings.

**Model:** `sentence-transformers/all-MiniLM-L6-v2`

**Process:**
1. Generate 384-dimensional embedding for query text
2. Use pre-computed embeddings from database (if available)
3. Calculate cosine similarity between embeddings
4. Return similarity score

**Weight in Combined Score:** 40%

**Advantages:**
- Captures semantic meaning
- Works well with synonyms and paraphrases
- Language-agnostic to some extent

**Graceful Degradation:**
If SBERT service is unavailable, the system continues with Jaccard and TF-IDF only, adjusting weights to 50% each.

---

## Data Sources

### Historical Topics
- **Table:** `historical_topics`
- **Filter:** All records
- **Purpose:** Reference past approved topics

### Current Session Topics
- **Table:** `current_session_topics`
- **Filter:** All records
- **Purpose:** Check against currently approved topics

### Under Review Topics
- **Table:** `under_review_topics`
- **Filter:** Last 48 hours only (`review_started_at > NOW() - INTERVAL '48 hours'`)
- **Purpose:** Check against topics currently being reviewed

---

## Usage Examples

### Example 1: Basic Topic Check

**Request:**
```bash
curl -X POST http://localhost:3000/api/similarity/check \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Blockchain Technology in Supply Chain Management"
  }'
```

**Response:**
```json
{
  "topic": "Blockchain Technology in Supply Chain Management",
  "keywords": null,
  "results": {
    "tier1_historical": [
      {
        "id": 789,
        "title": "Distributed Ledger Technology for Logistics",
        "scores": {
          "combined": 0.723
        }
      }
    ],
    "tier2_current_session": [],
    "tier3_under_review": []
  },
  "overallRisk": "MEDIUM",
  "processingTime": 856
}
```

### Example 2: Topic with Keywords

**Request:**
```bash
curl -X POST http://localhost:3000/api/similarity/check \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Natural Language Processing for Sentiment Analysis",
    "keywords": "BERT, transformers, text classification"
  }'
```

### Example 3: Using Postman

1. Set method to `POST`
2. Enter URL: `http://localhost:3000/api/similarity/check`
3. Go to Headers tab, add:
   - Key: `Content-Type`
   - Value: `application/json`
4. Go to Body tab, select `raw` and `JSON`
5. Enter request body:
```json
{
  "topic": "Your topic here",
  "keywords": "optional keywords"
}
```
6. Click Send

---

## Rate Limiting

**Window:** 15 minutes  
**Max Requests:** 100 per window

If rate limit is exceeded:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

---

## CORS Configuration

**Allowed Origins:** `*` (all origins in development)  
**Allowed Methods:** `GET, POST, PUT, DELETE, OPTIONS`  
**Allowed Headers:** `Content-Type, Authorization`

---

## Environment Variables

| Variable            | Default                    | Description                          |
|---------------------|----------------------------|--------------------------------------|
| PORT                | 3000                       | Server port                          |
| DATABASE_URL        | (required)                 | PostgreSQL connection string         |
| SBERT_SERVICE_URL   | http://localhost:8000      | SBERT microservice URL               |
| SBERT_TIMEOUT       | 5000                       | SBERT request timeout (ms)           |
| LOG_LEVEL           | info                       | Logging level                        |
| NODE_ENV            | development                | Environment (development/production) |

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "stack": "Stack trace (development only)"
}
```

**Common Errors:**

| Status | Error                  | Cause                                    |
|--------|------------------------|------------------------------------------|
| 400    | Bad Request            | Invalid input parameters                 |
| 404    | Not Found              | Route does not exist                     |
| 500    | Internal Server Error  | Database error, algorithm failure, etc.  |
| 503    | Service Unavailable    | SBERT service down (with graceful degradation) |

---

## Performance Considerations

**Typical Response Times:**
- With SBERT: 1-3 seconds (first request may take longer due to model loading)
- Without SBERT: 200-500 ms

**Optimization Tips:**
1. Pre-compute embeddings for all topics in database
2. Use database indexes on frequently queried fields
3. Cache frequently checked topics
4. Run SBERT service on GPU for faster inference

---

## Testing

Run integration tests:
```bash
npm test src/controllers/similarity.controller.test.js
```

Run all tests:
```bash
npm test
```

---

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review error messages in response
- Ensure SBERT service is running
- Verify database connection

---

**Last Updated:** December 2024  
**API Version:** 1.0.0
