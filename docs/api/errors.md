# Error Code Reference Guide

This document provides a comprehensive reference for all error codes used in the Topic Similarity API.

## Error Response Format

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

## Error Codes by Category

### 1. Client Errors (4xx)

#### VALIDATION_ERROR (400)
**Description**: Request validation failed. One or more required fields are missing or invalid.

**Common Causes**:
- Missing required fields
- Invalid data types
- Empty or whitespace-only strings
- Data doesn't meet validation rules

**Example Response**:
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

**How to Fix**:
- Check that all required fields are present
- Ensure data types match API expectations
- Verify field values meet validation rules

---

#### BAD_REQUEST (400)
**Description**: The request is malformed or contains invalid data.

**Common Causes**:
- Malformed JSON in request body
- Invalid content-type header
- Incorrect request format

**Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid JSON in request body"
  }
}
```

**How to Fix**:
- Validate JSON syntax before sending
- Set Content-Type header to `application/json`
- Follow API documentation for request format

---

#### UNAUTHORIZED (401)
**Description**: Authentication is required but was not provided or is invalid.

**Common Causes**:
- Missing authentication token
- Expired authentication token
- Invalid credentials

**Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**How to Fix**:
- Include valid authentication token in request
- Refresh expired tokens
- Verify credentials are correct

---

#### FORBIDDEN (403)
**Description**: The authenticated user doesn't have permission to access this resource.

**Common Causes**:
- Insufficient permissions
- Attempting to access restricted resources
- Account limitations

**Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

**How to Fix**:
- Verify user has required permissions
- Contact administrator for access
- Check account status

---

#### NOT_FOUND (404)
**Description**: The requested resource or endpoint doesn't exist.

**Common Causes**:
- Incorrect URL/endpoint
- Resource has been deleted
- Typo in route path

**Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route /api/non-existent-route not found"
  }
}
```

**How to Fix**:
- Verify the endpoint URL is correct
- Check API documentation for valid routes
- Ensure resource ID exists

---

#### RATE_LIMIT_EXCEEDED (429)
**Description**: Too many requests have been made in a short time period.

**Common Causes**:
- Exceeding rate limit threshold (100 requests per 15 minutes)
- Automated scripts making too many requests
- Multiple users sharing same IP

**Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 900
```

**How to Fix**:
- Wait for rate limit window to reset (15 minutes)
- Implement request throttling in your application
- Use exponential backoff for retries
- Contact support for higher rate limits

---

### 2. Server Errors (5xx)

#### DATABASE_ERROR (500)
**Description**: An error occurred while accessing the database.

**Common Causes**:
- Database connection failure
- Query timeout
- Database constraint violation
- Data integrity issues

**Example Response (Production)**:
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "A database error occurred. Please try again later."
  }
}
```

**Example Response (Development)**:
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Prisma error: Connection timeout",
    "stack": "Error: Connection timeout\n    at ..."
  }
}
```

**How to Fix**:
- Retry the request after a short delay
- If problem persists, contact support
- Check database status page

---

#### INTERNAL_SERVER_ERROR (500)
**Description**: An unexpected error occurred on the server.

**Common Causes**:
- Unhandled exceptions
- Service dependencies unavailable
- Configuration errors
- Resource exhaustion

**Example Response (Production)**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

**Example Response (Development)**:
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

**How to Fix**:
- Retry the request
- If problem persists, report to support with request details
- Check service status page

---

#### SERVICE_UNAVAILABLE (503)
**Description**: The service is temporarily unavailable.

**Common Causes**:
- Server maintenance
- Service overload
- Dependency service down (e.g., SBERT service)

**Example Response**:
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable. Please try again later."
  }
}
```

**How to Fix**:
- Wait and retry after a few minutes
- Check service status page
- Implement exponential backoff

---

## HTTP Status Code Mapping

| HTTP Status | Error Code(s) | Description |
|-------------|---------------|-------------|
| 400 | VALIDATION_ERROR, BAD_REQUEST | Bad request |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Access denied |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | DATABASE_ERROR, INTERNAL_SERVER_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service unavailable |

## Error Handling Best Practices

### For Frontend Developers

1. **Always Check Success Flag**:
```javascript
if (!response.success) {
  // Handle error
  console.error(response.error.code, response.error.message);
}
```

2. **Handle Specific Error Codes**:
```javascript
switch (response.error.code) {
  case 'VALIDATION_ERROR':
    // Show validation errors to user
    displayValidationErrors(response.error.details);
    break;
  case 'RATE_LIMIT_EXCEEDED':
    // Show rate limit message and retry after delay
    showRateLimitMessage();
    break;
  case 'NOT_FOUND':
    // Redirect to 404 page
    navigate('/404');
    break;
  default:
    // Show generic error message
    showErrorMessage(response.error.message);
}
```

3. **Display User-Friendly Messages**:
```javascript
const errorMessages = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT_EXCEEDED: 'You\'re making too many requests. Please wait a moment.',
  NOT_FOUND: 'The requested resource was not found.',
  DATABASE_ERROR: 'We\'re experiencing technical difficulties. Please try again.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.'
};

const userMessage = errorMessages[response.error.code] || response.error.message;
```

4. **Implement Retry Logic**:
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!data.success && data.error.code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = response.headers.get('Retry-After') || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return data;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### For Backend Developers

1. **Use AppError for Custom Errors**:
```javascript
const { AppError } = require('./middleware/errorHandler.middleware');

// Throw custom error
throw new AppError('Resource not found', 404, 'NOT_FOUND');
```

2. **Let Error Handler Catch Errors**:
```javascript
// Don't do this:
try {
  // code
} catch (error) {
  res.status(500).json({ error: error.message });
}

// Do this:
try {
  // code
} catch (error) {
  next(error); // Let error handler middleware handle it
}
```

3. **Add Context to Errors**:
```javascript
try {
  await database.query();
} catch (error) {
  error.context = { userId, operation: 'database_query' };
  throw error;
}
```

## Monitoring and Logging

All errors are automatically logged with Winston, including:
- Error message and stack trace
- HTTP status code
- Request method and path
- Request body
- Timestamp
- User context (if available)

**Log Levels**:
- `error`: All 5xx errors
- `warn`: All 4xx errors
- `info`: Successful requests

**Example Log Entry**:
```json
{
  "level": "error",
  "message": "Error occurred: Database connection failed",
  "timestamp": "2026-02-09T01:58:52.123Z",
  "statusCode": 500,
  "method": "POST",
  "path": "/api/similarity/check",
  "body": { "topic": "Machine Learning" },
  "stack": "Error: Database connection failed\n    at ..."
}
```

## Support

If you encounter persistent errors:
1. Check this reference guide for solutions
2. Review API documentation
3. Check service status page
4. Contact support with:
   - Error code
   - Request details
   - Timestamp
   - Steps to reproduce

## Version History

- **v1.0.0** (2026-02-09): Initial error code reference
  - Standardized error response format
  - Comprehensive error code documentation
  - Best practices and examples
