# Topic Similarity API Documentation

This is the current living API reference for the implemented backend contract.

## Overview

The Topic Similarity API checks a submitted research topic against historical, current-session, and under-review topic records. The backend runs Jaccard, TF-IDF, and SBERT when available. If SBERT is unavailable, the endpoint returns a partial-success response using lexical similarity only.

**Base URL:** `http://localhost:3000`  
**Content-Type:** `application/json`

## Endpoints

### Health Check

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "OK",
  "message": "Server is running",
  "environment": "development",
  "apiVersion": "v1"
}
```

### Topic Similarity Check

**Endpoint:** `POST /api/similarity/check`

Architecture alias: `POST /api/v1/check-similarity`

**Request Body:**

```json
{
  "topic": "Knowledge of malaria prevention among children under five",
  "keywords": "malaria, prevention, children"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `topic` | string | Yes | Must be a non-empty string. |
| `keywords` | string | No | Optional; currently appended to the comparison text. |

## Normal Success Response

Normal success uses `status: "success"` and a top-level `data` object.

```json
{
  "status": "success",
  "data": {
    "input_topic": "Knowledge of malaria prevention among children under five",
    "word_count": 8,
    "char_count": 60,
    "overall_risk": "HIGH",
    "max_similarity": 88,
    "tier1_historical": [
      {
        "id": 45,
        "title": "Malaria prevention in children",
        "year": "2022/2023",
        "supervisor": "Dr. Adeyemi",
        "category": "Infectious Diseases",
        "jaccard": 65.3,
        "tfidf": 72.1,
        "sbert": 84.2,
        "matched_keywords": ["malaria", "prevention", "children"]
      }
    ],
    "tier2_current": [
      {
        "id": 57,
        "title": "Malaria prevention knowledge among caregivers",
        "approved_date": "2026-01-15T10:30:00.000Z",
        "supervisor": "Dr. Balogun",
        "student_id": "STU-2024-057",
        "jaccard": 48.5,
        "tfidf": 59.2,
        "sbert": 76.8
      }
    ],
    "tier3_under_review": [
      {
        "id": 88,
        "title": "Malaria prevention practices among mothers",
        "reviewing_lecturer": "Dr. Ibrahim",
        "review_started_at": "2026-01-31T14:45:00.000Z",
        "minutes_ago": 30,
        "jaccard": 61.4,
        "tfidf": 68.2,
        "sbert": 88.7
      }
    ],
    "recommendation": "High similarity detected. Coordinate with Dr. Ibrahim before proceeding to avoid duplicate approvals."
  }
}
```

### Normal Data Fields

| Field | Type | Notes |
|-------|------|-------|
| `input_topic` | string | Submitted topic. |
| `word_count` | number | Word count of submitted topic. |
| `char_count` | number | Character count of submitted topic. |
| `overall_risk` | string | `LOW`, `MEDIUM`, or `HIGH`. |
| `max_similarity` | number | Highest SBERT score across returned tiers, exposed as `0-100`. |
| `tier1_historical` | array | Top 5 historical matches. |
| `tier2_current` | array | Current-session matches. |
| `tier3_under_review` | array | Under-review matches from the existing 48-hour query window. |
| `recommendation` | string | Backend-generated recommendation text. |

### Public Score Scale

Returned similarity scores are percentage-style values on a `0-100` scale. Normal success exposes `jaccard`, `tfidf`, and `sbert` separately. It does not expose a public `combined` score.

### Risk And Max Similarity

For normal success:

| Risk | Current implemented rule |
|------|--------------------------|
| `LOW` | Highest SBERT score is below `50`. |
| `MEDIUM` | Highest SBERT score is `50` through `69`. |
| `HIGH` | Highest SBERT score is `70` or higher. |

`max_similarity` is the highest SBERT score across returned Tier 1, Tier 2, and Tier 3 results.

### Tier Fields

**Tier 1 Historical**

| Field | Type |
|-------|------|
| `id` | number |
| `title` | string |
| `year` | string |
| `supervisor` | string |
| `category` | string or null |
| `jaccard` | number |
| `tfidf` | number |
| `sbert` | number |
| `matched_keywords` | array |

**Tier 2 Current**

| Field | Type |
|-------|------|
| `id` | number |
| `title` | string |
| `approved_date` | string or null |
| `supervisor` | string |
| `student_id` | string or null |
| `jaccard` | number |
| `tfidf` | number |
| `sbert` | number |

**Tier 3 Under Review**

| Field | Type |
|-------|------|
| `id` | number |
| `title` | string |
| `reviewing_lecturer` | string or null |
| `review_started_at` | string or null |
| `minutes_ago` | number or null |
| `jaccard` | number |
| `tfidf` | number |
| `sbert` | number |

## No-Topics Success Response

When the database query succeeds but there are no topic records to compare, the endpoint still returns success:

```json
{
  "status": "success",
  "data": {
    "input_topic": "Machine Learning Applications",
    "word_count": 3,
    "char_count": 29,
    "overall_risk": "LOW",
    "max_similarity": 0,
    "tier1_historical": [],
    "tier2_current": [],
    "tier3_under_review": [],
    "recommendation": "Topic appears unique. Proceed with approval."
  }
}
```

## Partial Success / SBERT Degraded Response

When SBERT is unavailable, the endpoint returns `partial_success`, keeps the top-level warning message, and exposes lexical scores only. Returned match objects set `sbert` to `null`.

```json
{
  "status": "partial_success",
  "message": "SBERT semantic analysis unavailable. Showing lexical similarity only (Jaccard, TF-IDF).",
  "data": {
    "input_topic": "Knowledge of malaria prevention among children under five",
    "word_count": 8,
    "char_count": 60,
    "overall_risk": "MEDIUM",
    "max_similarity": 72.1,
    "tier1_historical": [
      {
        "id": 45,
        "title": "Malaria prevention in children",
        "year": "2022/2023",
        "supervisor": "Dr. Adeyemi",
        "category": "Infectious Diseases",
        "jaccard": 65.3,
        "tfidf": 72.1,
        "sbert": null,
        "matched_keywords": ["malaria", "prevention"]
      }
    ],
    "tier2_current": [],
    "tier3_under_review": []
  }
}
```

For partial success, `max_similarity` and `overall_risk` are based on the highest lexical score, using `max(jaccard, tfidf)` across returned tiers.

## Error Responses

Reconciled error responses use this shape:

```json
{
  "status": "error",
  "message": "Human-readable message",
  "details": {
    "error_code": "ERROR_CODE"
  }
}
```

See [errors.md](errors.md) for the current reconciled error paths and paths that still need verification.

## Rate Limiting

Current documented response body for rate limiting:

```json
{
  "status": "error",
  "message": "Rate limit exceeded. Please try again in 5 minutes.",
  "details": {
    "retry_after": 300,
    "limit": "100 requests per hour"
  }
}
```

The response includes:

```http
Retry-After: 300
```

The exact enforcement window should be checked against environment configuration before changing rate-limit policy.

## Notes

- Category is currently returned as metadata and is not documented as a retrieval filter.
- Same-lecturer Tier 3 suppression is blocked until trusted lecturer identity is available in the request/auth context.
- Some internal combined-score calculations still exist in code, but they are not part of the current public normal-success API contract.
