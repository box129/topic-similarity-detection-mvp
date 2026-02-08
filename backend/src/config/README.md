# Configuration Module

This module handles all environment variable loading and validation for the application.

## Overview

The `env.js` file provides a centralized configuration object that loads and validates environment variables using `dotenv`. It ensures all required variables are present and provides sensible defaults for optional settings.

## Usage

```javascript
const config = require('./config/env');

// Access configuration values
console.log(config.port);              // 3000
console.log(config.database.url);      // PostgreSQL connection string
console.log(config.sbertService.url);  // SBERT service URL
```

## Configuration Structure

### Application Settings
- `env` - Application environment (development, production, test)
- `port` - Server port number
- `apiVersion` - API version string

### Database
- `database.url` - PostgreSQL connection string (required)

### SBERT Service
- `sbertService.url` - URL of the SBERT microservice
- `sbertService.timeout` - Request timeout in milliseconds
- `sbertService.retryAttempts` - Number of retry attempts for failed requests

### Rate Limiting
- `rateLimit.windowMs` - Time window for rate limiting
- `rateLimit.max` - Maximum requests per IP within window

### CORS
- `cors.origin` - Allowed origin for CORS requests
- `cors.credentials` - Allow credentials in CORS requests

### Logging
- `logging.level` - Log level (error, warn, info, debug, etc.)
- `logging.file` - Path to log file

### Similarity Settings
- `similarity.tier2Threshold` - Threshold for Tier 2 similarity (0.0-1.0)
- `similarity.tier3TimeWindowHours` - Time window for Tier 3 checks

## Environment Variables

All environment variables should be defined in a `.env` file in the project root. Use `env.example` as a template.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string

### Optional Variables (with defaults)
All other variables have sensible defaults and are optional. See `env.example` for the complete list.

## Validation

The module validates that all required environment variables are present on startup. If any required variables are missing, it will throw an error with details about which variables are missing.

## Example .env File

```env
# Server
PORT=3000
NODE_ENV=development

# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/topic_similarity?schema=public"

# SBERT Service
SBERT_SERVICE_URL=http://localhost:8000
SBERT_TIMEOUT=30000
SBERT_RETRY_ATTEMPTS=3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Similarity
SIMILARITY_TIER2_THRESHOLD=0.60
SIMILARITY_TIER3_TIME_WINDOW_HOURS=48
```

## Adding New Configuration

To add new configuration values:

1. Add the environment variable to `env.example`
2. Add the configuration property to the config object in `env.js`
3. If the variable is required, add it to the `required` array in `validateEnv()`
4. Update this README with the new configuration option
