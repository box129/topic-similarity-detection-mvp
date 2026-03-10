# AI Coding Agent Instructions for Topic Similarity MVP

A micro‑service system for detecting topic similarity in university research submissions. AI agents should grasp the three services, data flow, and key conventions before coding.

## 🧩 High‑Level Architecture

- **Backend API** (ackend/): Express.js on port 3000. Orchestrates algorithms, queries PostgreSQL via Prisma, computes risk levels, and serves REST endpoints.
- **SBERT Service** (sbert-service/): FastAPI/Python on port 8000. Generates 384‑dim embeddings. Calls are timeout‑protected (5 s) and may fail gracefully.
- **Frontend** (rontend/): React + Vite on port 5173. Single‑page app that submits topics and displays three tiers of similarity results with colour‑coded risk.

> See ackend/README.md for an exhaustive reference; this guide distills the operational essentials.

## 🔄 Backend Data Flow & Core Logic

1. Client POSTs /api/similarity/check with 	opic (+ optional keywords).
2. Controller pulls **three tables** (historical_topics, current_session_topics, under_review_topics) using raw SQL (embeddings cast to text). 48‑hour filter applies to under‑review.
3. Embeddings parsed from JSON; missing/invalid vectors logged and ignored.
4. Three algorithms run in parallel:
   - **Jaccard** – exact token overlap
   - **TF‑IDF** – term importance
   - **SBERT** – semantic similarity (may return 
ull when degraded)
5. Results combined with weights (40 % SBERT, 30 % each TF‑IDF/Jaccard; fallback 50/50 when SBERT unavailable). Constants live at top of similarity.controller.js.
6. Three tiers are computed:
   - Tier 1: top‑5 historical matches
   - Tier 2: current‑session matches ≥ SIMILARITY_TIER2_THRESHOLD (0.60 by default)
   - Tier 3: under‑review matches ≥ same threshold
7. Risk level is HIGH if max score ≥ 0.70 or any tier‑3 match; MEDIUM if ≥ 0.50 or tier‑2 matches; else LOW.

## 🛠️ Conventions & Patterns

- **Services** live under ackend/src/services. Each exports pure calculation functions. SBERT service handles HTTP calls and may cache embeddings.
- **Controllers** orchestrate business logic and error handling. Logging uses Winston (ackend/src/config/logger.js).
- **Errors**: use AppError (middleware in ackend/src/middleware/errorHandler.middleware.js). Throw to trigger uniform JSON responses.
- **Config**: ackend/src/config/env.js parses .env with validation. Additional vars include SIMILARITY_TIER2_THRESHOLD, SIMILARITY_TIER3_TIME_WINDOW_HOURS, and SBERT_TIMEOUT.
- **Database**: Prisma schema uses Unsupported( vector 384 ) for pgvector. Querying uses $queryRaw with manual parsing.
- **Logging**: structured logs with timestamps; helpers available in utils/logger.js.
- **Utility functions**: NLP preprocessing in src/utils/preprocessing.js (tested thoroughly).

## 🧪 Testing & Development

- Backend tests: Jest + Supertest. Located in ackend/tests/**. Coverage target 70 % (branches/functions/lines/statements). Exclude src/server.js and env.js.
- Mock SBERT and database where appropriate (see ackend/tests/__mocks__).
- Critical scenarios: algorithm isolation, risk logic, SBERT downtime, empty‑result handling.
- Pre‑commit/test scripts live in ackend/package.json. Many helper PowerShell/BAT scripts exist for Windows (un-all-tests.ps1, setup-db-interactive.ps1).

SBERT service has its own Python venv; activate and run python app.py. Frontend uses 
pm run dev and Vitest for unit tests.

## 🔌 Setup & Scripts

`ash
# backend
npm install
cp .env.example .env  # set DATABASE_URL, SBERT_SERVICE_URL, etc.
npm run prisma:generate
npm run prisma:push
npm run dev            # nodemon
npm test

# sbt-service
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python app.py

# frontend
npm install
npm run dev
`

Extra scripts for Windows appear in ackend/ (batch and PowerShell) and help with firewall, admin privileges, or manual API testing.

## 📁 Key Files & Entry Points

| Purpose | Location |
|---------|----------|
| Jaccard/TF‑IDF/SBERT logic | ackend/src/services/*.service.js |
| Response aggregation & risk logic | ackend/src/controllers/similarity.controller.js |
| App entry | ackend/src/server.js |
| Env validation | ackend/src/config/env.js |
| DB schema | ackend/prisma/schema.prisma |
| Error middleware | ackend/src/middleware/errorHandler.middleware.js |
| SBERT API | sbert-service/app.py |
| Frontend form & display | rontend/src/ |

## ⚠️ Common Pitfalls

- SBERT timeouts or connection failures – controller degrades gracefully and logs warnings.
- Embeddings stored as text require JSON.parse; malformed vectors become 
ull.
- Rate limiter may interfere with Jest tests; mocks are provided.
- Use 
pm run prisma:push (no migrations) for Neon compatibility.

---

This document is the primary cheat sheet; refer to the extensive markdown files in the repo for deeper context (ALGORITHM-TESTS-*.md, API-DOCUMENTATION.md, etc.).

**Last updated:** March 8, 2026
