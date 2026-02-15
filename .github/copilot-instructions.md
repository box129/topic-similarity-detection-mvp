# AI Coding Agent Instructions for Topic Similarity MVP

This codebase implements a **tri-algorithm topic similarity detection system** for university research submissions. Understand the architecture before making changes.

## 🏗️ Architecture Overview

**Three-service microservices architecture:**

1. **Backend API** (`backend/`) - Express.js service on port 3000
   - Coordinates all similarity algorithms
   - Manages database interactions via Prisma ORM
   - Returns risk-level assessments (LOW/MEDIUM/HIGH)

2. **SBERT Service** (`sbert-service/`) - FastAPI microservice on port 8000
   - Python-based semantic embedding generation using `sentence-transformers` model
   - Produces 384-dimensional embeddings for topics
   - **Critical:** API calls have 5-second timeout; service failure triggers graceful fallback

3. **Frontend** (`frontend/`) - React + Vite on port 5173
   - Single-page form for topic submission
   - Displays 3-tier results: historical (top 5), current session (≥60%), under review (≥60%)
   - Risk-level color coding (Green/Yellow/Red)

**Data Flow:**
- User submits topic → Frontend calls `/api/similarity/check`
- Backend fetches topics from 3 Prisma tables (historical, current_session, under_review)
- Runs **Jaccard** + **TF-IDF** + **SBERT** algorithms in parallel
- Combines scores, calculates risk level, returns formatted response
- If SBERT times out: fall back to 2 algorithms, show warning message

## 🔑 Key Patterns & Conventions

### Algorithm Services (backend/src/services/)
Each algorithm is isolated in its own service file and follows the same pattern:

```javascript
// services/jaccard.service.js / tfidf.service.js / sbert.service.js
function calculateSimilarity(queryText, targetText, targetEmbedding) {
  // Returns score 0-1
  return { score, metadata? }
}
// Export only calculation functions, not state
```

**Important:** SBERT service is async and calls external microservice. Always wrap in try-catch and handle timeouts:
```javascript
// In sbert.service.js
const SBERT_TIMEOUT = parseInt(process.env.SBERT_TIMEOUT || '5000', 10);
// Queries fail after 5 seconds; controller detects and falls back
```

### Database Schema (prisma/schema.prisma)
Three separate tables with identical schemas (including `embedding` field for pgvector):
- `historical_topics` - Historical submissions (large dataset)
- `current_session_topics` - Active semester submissions
- `under_review_topics` - Topics in review (filtered to last 48 hours only)

All use `Unsupported("vector(384)")` for pgvector integration. Raw SQL queries in controller parse embeddings as JSON strings.

### Error Handling
Custom `AppError` class in [middleware/errorHandler.middleware.js](backend/src/middleware/errorHandler.middleware.js):
```javascript
throw new AppError(message, statusCode, errorCode);
// errorHandler middleware catches and formats response
```

All errors logged via Winston logger with structured format (level, timestamp, message, metadata).

### API Response Format
Always return consistent structure:
```json
{
  "status": "success|degraded|error",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "algorithms": {
    "jaccard": { "score": 0.85, "topResults": [...] },
    "tfidf": { "score": 0.82, "topResults": [...] },
    "sbert": { "score": 0.88, "topResults": [...] }
  },
  "warnings": ["SBERT unavailable"] // Only if degraded
}
```

## 🧪 Testing & Development

### Run Commands
```bash
# Backend
npm install                  # Install dependencies
npm run dev                 # Start with nodemon (port 3000)
npm test                    # Run Jest with coverage (70% threshold)
npm run prisma:generate     # Generate Prisma client
npm run prisma:push         # Sync schema to database
npm run prisma:studio       # Web UI for database

# SBERT Service
python -m venv venv         # Create virtual environment
.\venv\Scripts\Activate.ps1 # Activate (Windows)
pip install -r requirements.txt
python app.py               # Start FastAPI on port 8000

# Frontend
npm install
npm run dev                 # Vite dev server on port 5173
npm test                    # Vitest
```

### Test Structure
- Backend uses Jest with Supertest for HTTP testing
- Tests in files matching `**/*.test.js` or `**/__tests__/**`
- Coverage threshold: 70% (branches, functions, lines, statements)
- Exclude `src/server.js` and `src/config/env.js` from coverage
- Tests in [backend/tests/](backend/tests/) parallel source structure

### Critical Test Cases
When modifying similarity algorithms:
1. **Algorithm isolation** - Each algorithm produces consistent scores independently
2. **Risk level logic** - MAX(scores) ≥70% → HIGH; ≥50% OR Tier2 matches → MEDIUM; else LOW
3. **SBERT timeout** - Verify graceful fallback when service unavailable
4. **Empty results** - Return empty arrays, not null; handle edge cases

## 📊 Similarity Scoring Rules

**Three-tier results:**
- **Tier 1:** Top 5 historical topics (always shown, sorted by score DESC)
- **Tier 2:** Current session topics with similarity ≥60%
- **Tier 3:** Under-review topics (48-hour window) with similarity ≥60%

**Risk level calculation (in [similarity.controller.js](backend/src/controllers/similarity.controller.js)):**
```javascript
const maxScore = Math.max(jaccard, tfidf, sbert);
riskLevel = 
  maxScore >= 0.70 || tier3Matches.length > 0 ? 'HIGH'
  : maxScore >= 0.50 || tier2Matches.length > 0 ? 'MEDIUM'
  : 'LOW'
```

## 🔌 Environment Configuration

Config files in [backend/src/config/](backend/src/config/):
- [env.js](backend/src/config/env.js) - Loads from `.env` via dotenv, validates required variables
- [logger.js](backend/src/config/logger.js) - Winston logger with file + console transports
- [database.js](backend/src/config/database.js) - Prisma client setup

**Required `.env` variables:**
- `NODE_ENV` - development/test/production
- `PORT` - Backend port (default 3000)
- `DATABASE_URL` - PostgreSQL connection string with pgvector
- `SBERT_SERVICE_URL` - SBERT microservice URL (default http://localhost:8000)
- `CORS_ORIGIN` - Frontend URL for CORS

## 🚨 Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| SBERT times out (>5s) | Controller detects timeout, removes SBERT from algorithms, shows warning |
| Embedding parse fails | Logging warns but continues; algorithm treated as unavailable |
| Database disconnects | Prisma reconnects; unhandled Prisma errors caught by error handler |
| Rate limiting blocks tests | Jest runs with rate limiter; configure in test env or mock `express-rate-limit` |
| pgvector comparisons fail | Ensure embedding columns are valid vectors; null embeddings are skipped |

## 📁 Key Files by Purpose

**Algorithm logic:** [backend/src/services/jaccard.service.js](backend/src/services/jaccard.service.js), tfidf.service.js, sbert.service.js
**Result aggregation:** [backend/src/controllers/similarity.controller.js](backend/src/controllers/similarity.controller.js) (lines 1-200)
**Risk calculation:** [backend/src/controllers/similarity.controller.js](backend/src/controllers/similarity.controller.js) (lines 250-300)
**API responses:** [backend/API-DOCUMENTATION.md](backend/API-DOCUMENTATION.md)
**Database schema:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
**Error handling:** [backend/src/middleware/errorHandler.middleware.js](backend/src/middleware/errorHandler.middleware.js)
**Configuration:** [backend/src/config/env.js](backend/src/config/env.js)

---

**Last updated:** February 15, 2026
