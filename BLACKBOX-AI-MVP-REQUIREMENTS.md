# BlackboxAI MVP Implementation Requirements
## Research Topic Similarity Detection System - UNIOSUN Public Health

**Date:** February 8, 2026  
**Phase:** MVP Development  
**Target Completion:** 10 weeks  
**Developer:** BlackboxAI + Human Oversight

---

## 🎯 MVP Scope Definition

### Core Features (MUST HAVE)

1. **Topic Similarity Checking**
   - Single text input field for research topic
   - Real-time character/word counter (7-24 words required)
   - Optional keywords field
   - Submit button triggers tri-algorithm analysis

2. **Tri-Algorithm Analysis**
   - Jaccard Similarity (set-based, token overlap)
   - TF-IDF + Cosine Similarity (statistical)
   - SBERT Embeddings (semantic, paraphrase-aware)
   - All three run in parallel
   - Results combined into single response

3. **Three-Tier Results Display**
   - **Tier 1:** Top 5 most similar historical topics (always shown)
   - **Tier 2:** Current session topics with ≥60% similarity (filtered)
   - **Tier 3:** Topics under review (last 48hrs) with ≥60% similarity (concurrent alert)
   - Each result shows: title, similarity score, supervisor, session/status

4. **Risk Level Calculation**
   - **LOW (Green):** Max similarity <50%, no Tier 2/3 matches
   - **MEDIUM (Yellow):** Max similarity 50-69%, OR Tier 2 matches exist
   - **HIGH (Red):** Max similarity ≥70%, OR Tier 3 matches exist
   - Visual color coding + clear recommendation text

5. **Graceful SBERT Degradation**
   - If SBERT service fails/unavailable: fall back to Jaccard + TF-IDF only
   - Display warning: "Using 2 of 3 algorithms (SBERT unavailable)"
   - System remains functional

6. **Desktop-First Responsive Design**
   - Optimized for 1920x1080, 1366x768 desktop screens
   - Mobile (≤768px): Show banner "Desktop recommended for best experience"
   - Basic mobile functionality maintained

### Explicitly OUT OF SCOPE (Post-MVP)

❌ User authentication/login  
❌ Topic approval workflow  
❌ Email notifications  
❌ PDF report generation  
❌ Data export (CSV/Excel)  
❌ Historical trend charts  
❌ Multi-department support  
❌ Admin dashboard  
❌ User management  
❌ Audit logs  

---

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js 20.x LTS
- **Framework:** Express 4.18.2
- **Database ORM:** Prisma 5.7.1
- **Database:** PostgreSQL 15 + pgvector extension (Neon hosted)
- **NLP Library:** natural 6.10.2 (Jaccard, TF-IDF)
- **HTTP Client:** axios 1.6.5 (SBERT calls)
- **Logging:** winston 3.11.0
- **Security:** helmet 7.1.0, cors 2.8.5, express-rate-limit 7.1.5
- **Testing:** jest 29.7.0, supertest 6.3.3

### SBERT Microservice
- **Runtime:** Python 3.10+
- **Framework:** FastAPI 0.109.0
- **ML Library:** sentence-transformers 2.2.2
- **Model:** all-MiniLM-L6-v2 (384-dimensional embeddings)
- **Server:** uvicorn 0.27.0

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Styling:** Tailwind CSS 3.4.0 (via CDN for MVP)
- **HTTP Client:** axios 1.6.5
- **Testing:** Vitest + React Testing Library

### Deployment
- **Backend API:** Render (free tier, 512 MB RAM)
- **SBERT Service:** Render (free tier, 512 MB RAM, Docker)
- **Frontend:** Vercel (free tier)
- **Database:** Neon PostgreSQL (free tier, 512 MB storage)

---

## 📂 Git Repository Structure

### Repository Setup

**Repository Name:** `topic-similarity-detection-mvp`  
**Hosting:** GitHub (private or public as per thesis requirement)  
**Branch Strategy:** trunk-based (main branch only for MVP)

### Directory Structure

```
topic-similarity-detection-mvp/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Future: CI/CD pipeline
│
├── backend/                          # Node.js Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js               # Environment configuration
│   │   ├── controllers/
│   │   │   └── similarity.controller.js
│   │   ├── services/
│   │   │   ├── jaccard.service.js
│   │   │   ├── tfidf.service.js
│   │   │   └── sbert.service.js
│   │   ├── utils/
│   │   │   ├── preprocessing.js     # Text preprocessing
│   │   │   └── logger.js            # Winston logger
│   │   ├── middleware/
│   │   │   ├── validation.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── migrations/              # Prisma migrations
│   │   └── seed.js                  # 60-topic seed script
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── preprocessing.test.js
│   │   │   ├── jaccard.test.js
│   │   │   └── tfidf.test.js
│   │   └── integration/
│   │       └── api.test.js          # API endpoint tests
│   ├── .env.example                 # Environment template
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── README.md                    # Backend setup guide
│
├── sbert-service/                    # Python FastAPI microservice
│   ├── app.py                       # FastAPI application
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Container for Render deployment
│   ├── .gitignore
│   └── README.md                    # SBERT service setup
│
├── frontend/                         # React + Vite application
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Badge.jsx
│   │   │   └── features/
│   │   │       ├── TopicInput/
│   │   │       │   ├── TopicForm.jsx
│   │   │       │   └── CharacterCounter.jsx
│   │   │       └── Results/
│   │   │           ├── ResultsDisplay.jsx
│   │   │           ├── RiskBanner.jsx
│   │   │           ├── TierResults.jsx
│   │   │           └── AlgorithmBadges.jsx
│   │   ├── services/
│   │   │   ├── api.js               # Axios client
│   │   │   └── similarityService.js
│   │   ├── utils/
│   │   │   └── validation.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tests/
│   │   ├── TopicForm.test.jsx
│   │   └── ResultsDisplay.test.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md                    # Frontend setup guide
│
├── docs/                             # Documentation
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide (Render + Vercel)
│   ├── TESTING.md                   # Testing guide
│   └── ARCHITECTURE.md              # System architecture overview
│
├── .gitignore                       # Root gitignore
├── README.md                        # Project overview + quick start
├── LICENSE                          # License file (optional)
└── CHANGELOG.md                     # Version history
```

---

## 🏷️ Git Commit Strategy

### Semantic Commit Messages

Use **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body> (optional)

<footer> (optional)
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance (deps, config)

**Examples:**
```bash
feat(backend): implement Jaccard similarity algorithm
fix(frontend): correct word count validation logic
docs(readme): add deployment instructions
test(backend): add unit tests for preprocessing
chore(deps): upgrade React to 18.2.0
```

### Commit Frequency

**Commit after:**
1. ✅ Each feature completion (e.g., "Jaccard algorithm implemented")
2. ✅ Each bug fix
3. ✅ Before switching contexts (end of work session)
4. ✅ After significant refactoring
5. ✅ When tests pass

**DO NOT commit:**
- ❌ Broken code (unless explicitly WIP branch)
- ❌ node_modules/ or .env files
- ❌ IDE-specific files (.vscode/, .idea/)
- ❌ Build artifacts (dist/, build/)

### Baseline Tags Strategy

#### Initial Setup Tag
```bash
git tag -a v0.1.0 -m "Initial project setup - folder structure, dependencies"
git push origin v0.1.0
```

#### MVP Milestone Tags

**Week 1-2: Environment & Infrastructure**
```bash
v0.2.0 - Backend environment setup complete
v0.3.0 - SBERT microservice operational
v0.4.0 - Database schema + migrations + seeding
```

**Week 3-4: Algorithm Implementation**
```bash
v0.5.0 - Jaccard + TF-IDF algorithms implemented
v0.6.0 - SBERT integration complete
v0.7.0 - Main API endpoint functional
```

**Week 5-6: Frontend Development**
```bash
v0.8.0 - React setup + basic UI components
v0.9.0 - Results display + color-coded risk levels
v0.10.0 - Graceful SBERT degradation UI
```

**Week 7-8: Testing & Refinement**
```bash
v0.11.0 - Unit tests (70% coverage)
v0.12.0 - Integration tests passing
v0.13.0 - E2E testing complete
```

**Week 9-10: Deployment & Documentation**
```bash
v0.14.0 - Backend deployed to Render
v0.15.0 - Frontend deployed to Vercel
v1.0.0 - MVP Release - Production Ready
```

#### Tag Naming Convention

**Format:** `vMAJOR.MINOR.PATCH`

- **v0.x.x** - Pre-release (MVP development)
- **v1.0.0** - MVP Release (thesis demo ready)
- **v1.x.x** - Post-MVP improvements

**Create annotated tags:**
```bash
git tag -a v0.5.0 -m "Algorithms: Jaccard + TF-IDF implemented and tested"
git push origin v0.5.0
```

**List all tags:**
```bash
git tag -l -n1
```

---

## 📋 Implementation Checklist

### Phase 1: Project Setup (Week 1)

**Backend Setup:**
- [ ] Initialize Node.js project (`npm init`)
- [ ] Install dependencies (Express, Prisma, etc.)
- [ ] Create folder structure
- [ ] Setup .env.example and .env (local)
- [ ] Configure ESLint + Prettier
- [ ] Commit: `chore: initial backend setup`
- [ ] Tag: `v0.1.0`

**SBERT Service Setup:**
- [ ] Create Python virtual environment
- [ ] Install FastAPI + sentence-transformers
- [ ] Create app.py with /embed and /health endpoints
- [ ] Create requirements.txt
- [ ] Create Dockerfile
- [ ] Test locally: `curl http://localhost:8000/health`
- [ ] Commit: `feat(sbert): implement embedding service`
- [ ] Tag: `v0.2.0`

**Database Setup:**
- [ ] Create Prisma schema with 3 tables + pgvector
- [ ] Generate Prisma client
- [ ] Create initial migration
- [ ] Create seed script with 60 topics
- [ ] Run seed: `npm run prisma:seed`
- [ ] Verify: 50 historical + 10 current + 3 under review
- [ ] Commit: `feat(database): setup schema, migrations, and seed data`
- [ ] Tag: `v0.3.0`

### Phase 2: Backend Algorithm Implementation (Week 2-3)

**Text Preprocessing:**
- [ ] Implement tokenization (natural library)
- [ ] Implement stop word removal
- [ ] Implement stemming (PorterStemmer)
- [ ] Write unit tests (preprocessing.test.js)
- [ ] Commit: `feat(backend): implement text preprocessing utilities`

**Jaccard Similarity:**
- [ ] Implement calculateJaccard() function
- [ ] Implement calculateBatch() for multiple topics
- [ ] Write unit tests (jaccard.test.js)
- [ ] Test: identical texts = 1.0, different = 0.0
- [ ] Commit: `feat(backend): implement Jaccard similarity algorithm`

**TF-IDF Similarity:**
- [ ] Implement TF-IDF using natural.TfIdf
- [ ] Implement cosine similarity calculation
- [ ] Write unit tests (tfidf.test.js)
- [ ] Commit: `feat(backend): implement TF-IDF + cosine similarity`

**SBERT Integration:**
- [ ] Create SBERT service client (axios)
- [ ] Implement error handling + retry logic
- [ ] Implement graceful degradation (fallback to null)
- [ ] Write integration test (mock SBERT service)
- [ ] Commit: `feat(backend): integrate SBERT microservice with fallback`
- [ ] Tag: `v0.5.0`

### Phase 3: API Development (Week 4)

**Main Controller:**
- [ ] Implement POST /api/v1/check-similarity
- [ ] Fetch all 3 tables in parallel (Prisma)
- [ ] Run 3 algorithms in parallel (Promise.all)
- [ ] Combine results into 3 tiers
- [ ] Calculate overall risk level
- [ ] Return JSON response
- [ ] Commit: `feat(api): implement main similarity endpoint`

**Validation Middleware:**
- [ ] Validate topic length (7-24 words)
- [ ] Return 400 for invalid input
- [ ] Write unit tests
- [ ] Commit: `feat(api): add input validation middleware`

**Error Handling:**
- [ ] Implement global error handler
- [ ] Return consistent error format
- [ ] Log errors with Winston
- [ ] Commit: `feat(api): add error handling middleware`

**Health Check:**
- [ ] Implement GET /api/v1/health
- [ ] Test database connection
- [ ] Return service status
- [ ] Commit: `feat(api): add health check endpoint`
- [ ] Tag: `v0.7.0`

### Phase 4: Frontend Development (Week 5-6)

**React Setup:**
- [ ] Create Vite project: `npm create vite@latest`
- [ ] Install dependencies (React, axios)
- [ ] Add Tailwind CSS via CDN
- [ ] Setup folder structure
- [ ] Commit: `chore(frontend): initialize React + Vite project`
- [ ] Tag: `v0.8.0`

**Topic Input Form:**
- [ ] Create TopicForm.jsx
- [ ] Implement real-time word counter (7-24 words)
- [ ] Add character counter (50-180 chars)
- [ ] Add validation states (valid/invalid)
- [ ] Style with Tailwind (green/red borders)
- [ ] Commit: `feat(frontend): implement topic input form with validation`

**Results Display:**
- [ ] Create ResultsDisplay.jsx
- [ ] Create RiskBanner.jsx (color-coded: green/yellow/red)
- [ ] Create TierResults.jsx (3 collapsible sections)
- [ ] Display similarity scores as percentages
- [ ] Show supervisor names, session years
- [ ] Commit: `feat(frontend): implement results display with 3-tier layout`

**Algorithm Status:**
- [ ] Create AlgorithmBadges.jsx
- [ ] Show which algorithms were used (Jaccard, TF-IDF, SBERT)
- [ ] Display warning if SBERT unavailable
- [ ] Commit: `feat(frontend): add algorithm status indicators`
- [ ] Tag: `v0.9.0`

**API Integration:**
- [ ] Create api.js (axios client)
- [ ] Create similarityService.js
- [ ] Implement error handling
- [ ] Show loading spinner during API call
- [ ] Commit: `feat(frontend): integrate backend API`

**Mobile Responsive:**
- [ ] Add mobile warning banner (≤768px)
- [ ] Test on mobile viewport
- [ ] Commit: `feat(frontend): add mobile responsive behavior`
- [ ] Tag: `v0.10.0`

### Phase 5: Testing (Week 7-8)

**Backend Unit Tests:**
- [ ] Test preprocessing utilities
- [ ] Test Jaccard algorithm
- [ ] Test TF-IDF algorithm
- [ ] Achieve 70% code coverage
- [ ] Commit: `test(backend): add unit tests for algorithms`

**Backend Integration Tests:**
- [ ] Test POST /api/v1/check-similarity endpoint
- [ ] Test validation (too short, too long)
- [ ] Test graceful SBERT degradation
- [ ] Test health check endpoint
- [ ] Commit: `test(backend): add API integration tests`
- [ ] Tag: `v0.12.0`

**Frontend Tests:**
- [ ] Test TopicForm validation
- [ ] Test ResultsDisplay rendering
- [ ] Test API error handling
- [ ] Commit: `test(frontend): add component tests`
- [ ] Tag: `v0.13.0`

### Phase 6: Deployment (Week 9-10)

**Backend Deployment (Render):**
- [ ] Create render.yaml config
- [ ] Set environment variables on Render
- [ ] Deploy backend service
- [ ] Run database migration on Neon
- [ ] Run seed script on production DB
- [ ] Test: `curl https://your-backend.onrender.com/api/v1/health`
- [ ] Commit: `deploy(backend): configure Render deployment`
- [ ] Tag: `v0.14.0`

**SBERT Deployment (Render):**
- [ ] Deploy SBERT service (Docker)
- [ ] Test: `curl https://your-sbert.onrender.com/health`
- [ ] Update backend SBERT_SERVICE_URL
- [ ] Commit: `deploy(sbert): deploy to Render with Docker`

**Frontend Deployment (Vercel):**
- [ ] Create vercel.json config
- [ ] Set VITE_API_URL environment variable
- [ ] Deploy to Vercel
- [ ] Test live frontend
- [ ] Commit: `deploy(frontend): configure Vercel deployment`
- [ ] Tag: `v0.15.0`

**Final Release:**
- [ ] Update README with production URLs
- [ ] Create CHANGELOG.md
- [ ] Create API.md documentation
- [ ] Create DEPLOYMENT.md guide
- [ ] Tag: `v1.0.0 - MVP Release - Production Ready`

---

## 🔧 Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database (Neon)
DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"

# SBERT Service
SBERT_SERVICE_URL=https://your-sbert-service.onrender.com
SBERT_TIMEOUT_MS=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS_PER_IP=100

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app

# Logging
LOG_LEVEL=info
LOG_FILE=logs/combined.log
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### SBERT Service (.env)

```bash
# No environment variables needed for MVP
```

---

## 📊 Success Criteria

### Functional Requirements

- [x] Lecturer can enter a research topic (7-24 words)
- [x] System validates input in real-time
- [x] System runs 3 algorithms in parallel
- [x] Results display in 3 tiers with color-coded risk
- [x] SBERT failure doesn't break the system
- [x] Mobile users see warning banner

### Non-Functional Requirements

- [x] API response time <1s (p95)
- [x] 70% unit test coverage
- [x] 10-15 concurrent users supported
- [x] Deployed to free-tier services
- [x] Database seeded with 60 topics
- [x] Documentation complete (README, API, Deployment)

### Thesis Demo Requirements

- [x] System accessible via public URL
- [x] Can demonstrate duplicate detection
- [x] Can show graceful SBERT degradation
- [x] Can explain tri-algorithm approach
- [x] Git history shows iterative development
- [x] Tests demonstrate validation

---

## 📖 Documentation Requirements

### README.md (Root)

**Must include:**
1. Project overview
2. MVP feature list
3. Tech stack
4. Quick start (local development)
5. Deployment URLs
6. License

### API.md

**Must include:**
1. Endpoint documentation
   - POST /api/v1/check-similarity
   - GET /api/v1/health
2. Request/response schemas
3. Error codes
4. Example cURL commands

### DEPLOYMENT.md

**Must include:**
1. Render backend deployment steps
2. Render SBERT deployment steps
3. Vercel frontend deployment steps
4. Environment variable setup
5. Database migration guide

### ARCHITECTURE.md

**Must include:**
1. System architecture diagram
2. Data flow explanation
3. Algorithm descriptions (Jaccard, TF-IDF, SBERT)
4. Three-tier results logic
5. Graceful degradation strategy

---

## 🚨 Critical Implementation Notes

### Database Seeding

**IMPORTANT:** The seed script must:
1. Clear existing data first
2. Generate SBERT embeddings for all topics (requires SBERT service running)
3. Insert 50 historical + 10 current + 3 under review topics
4. Use raw SQL for pgvector insertion: `${embedding}::vector`

**Fallback:** If SBERT unavailable during seeding, use zero vectors `Array(384).fill(0)`

### SBERT Cold Start

**Known Issue:** Render free tier spins down after 15 minutes of inactivity.

**Mitigation:**
1. Document this as "acceptable for MVP"
2. First request after spin-down takes 10-15 seconds
3. Consider adding "warming up" message in UI
4. Post-MVP: Upgrade to paid tier ($7/month) or implement keep-alive ping

### Rate Limiting

**Configuration:**
- 100 requests per hour per IP
- 10 requests per minute per IP
- Applied to /api/v1/* routes only
- Health check exempt

### CORS Configuration

**Development:**
```javascript
cors({ origin: 'http://localhost:5173', credentials: true })
```

**Production:**
```javascript
cors({ origin: 'https://your-frontend.vercel.app', credentials: true })
```

---

## 🎬 Getting Started (For BlackboxAI)

### Step 1: Initialize Git Repository

```bash
git init
git add .
git commit -m "chore: initial project setup"
git tag -a v0.1.0 -m "Initial project structure"
git remote add origin https://github.com/your-username/topic-similarity-detection-mvp.git
git push -u origin main
git push origin v0.1.0
```

### Step 2: Setup Backend

```bash
cd backend
npm init -y
npm install express@4.18.2 @prisma/client@5.7.1 dotenv@16.3.1 cors@2.8.5 helmet@7.1.0 express-rate-limit@7.1.5 natural@6.10.2 axios@1.6.5 winston@3.11.0
npm install -D nodemon@3.0.2 jest@29.7.0 supertest@6.3.3 prisma@5.7.1
npx prisma init
```

### Step 3: Setup SBERT Service

```bash
cd sbert-service
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn sentence-transformers
```

### Step 4: Setup Frontend

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios
```

### Step 5: Follow Implementation Checklist

Work through each phase sequentially, committing frequently with semantic commit messages.

---

## 📞 Support & Questions

**For implementation issues:**
1. Refer to SDLC-Project/05-Implementation/ notes in Obsidian
2. Check API documentation in docs/API.md
3. Review git commit history for similar changes
4. Consult deployment guide in docs/DEPLOYMENT.md

**Thesis advisor review points:**
1. After v0.5.0 (algorithms complete)
2. After v0.10.0 (MVP UI complete)
3. After v1.0.0 (deployment complete)

---

**Last Updated:** February 8, 2026  
**Version:** 1.0  
**Status:** Ready for BlackboxAI Implementation
