# Current Project Status

## Project Overview

Topic Similarity MVP is a tri-algorithm research-topic similarity checker. It combines a Node/Express backend, a React/Vite frontend, a Python FastAPI SBERT-style embedding service, and a PostgreSQL/Prisma data model for comparing submitted topics against existing topic records.

## Main Repo Areas

- `backend/`: Express API, Prisma schema, similarity services, middleware, tests, and local setup scripts.
- `frontend/`: React/Vite UI for entering topics and displaying risk/tiered similarity results.
- `sbert-service/`: FastAPI service for generating 384-dimensional embeddings, with a fallback embedding mode.
- `docs/`: project documentation, currently including API documentation.
- Root `*.md` files: historical setup notes, audit/status reports, usage guides, and implementation summaries.
- Seed CSV files: sample/import data used for topic records.

## Confirmed Implemented Functionality

- Backend health routes exist at `/health` and `/api/v1/health`.
- Backend similarity routes exist at `/api/similarity/check` and `/api/v1/check-similarity`.
- Jaccard similarity service is implemented.
- TF-IDF similarity service is implemented.
- SBERT integration service is implemented with graceful fallback when the embedding service is unavailable.
- Similarity controller fetches historical, current-session, and under-review topics.
- Three result tiers are implemented: historical, current session, and under review.
- LOW/MEDIUM/HIGH risk calculation exists.
- React topic input form exists with word-count validation and optional keywords/category.
- React results display exists with risk banner, tier sections, and expandable technical scores.
- Prisma schema defines historical, current-session, and under-review topic models.
- Backend and frontend test files/configuration exist.

## Protected Core Files

- `backend/src/server.js`
- `backend/src/controllers/similarity.controller.js`
- `backend/src/services/jaccard.service.js`
- `backend/src/services/tfidf.service.js`
- `backend/src/services/sbert.service.js`
- `backend/src/utils/preprocessing.js`
- `backend/src/config/env.js`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `sbert-service/app.py`
- `sbert-service/requirements.txt`
- `frontend/src/App.jsx`
- `frontend/src/components/features/TopicInput/TopicForm.jsx`
- `frontend/src/components/features/Results/ResultsDisplay.jsx`
- `frontend/vite.config.js`
- `frontend/package.json`
- `frontend/package-lock.json`

## Known Risks Or Inconsistencies

- The worktree currently contains uncommitted changes; these should be protected from accidental overwrite.
- `frontend/vite.config.js` proxies `/api` to `http://localhost:8080`, while project docs often describe the backend as running on port `3000`; needs verification.
- README/status documents mention different React versions than `frontend/package.json`; needs verification.
- README/status documents report test counts and coverage, but current test status was not rerun; needs verification.
- SBERT service can fall back to deterministic hash-based embeddings, which may not behave like semantic SBERT embeddings; needs verification for intended production behavior.
- Some documentation appears historical or generated and may be stale; needs verification.
- Generated/local folders such as `coverage/`, `dist/`, `logs/`, and `sbert-service/venv/` are present and should not be treated as source files.

## Items That Still Need Verification

- Whether backend starts successfully in the current environment.
- Whether frontend starts successfully and reaches the backend.
- Whether the SBERT service starts with real `sentence-transformers` available.
- Whether the database connection and Prisma schema match the actual database.
- Whether seed scripts and CSV data import successfully.
- Whether all backend tests pass.
- Whether all frontend tests pass.
- Whether end-to-end topic submission works from UI to backend to results display.
- Whether API response documentation matches the current backend response shape.
