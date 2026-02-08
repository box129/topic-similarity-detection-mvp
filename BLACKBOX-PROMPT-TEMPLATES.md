# BlackboxAI IDE Prompt Templates
## How to Effectively Request Code Generation

**Important:** BlackboxAI IDE generates code on request but doesn't manage the project autonomously. You need to guide it step-by-step.

---

## 🎯 Prompt Strategy: Start Small, Build Incrementally

### **Phase 1: Backend Setup (Week 1)**

#### Prompt 1: Initialize Backend
```
Create a Node.js backend project structure for an Express API with the following:

- package.json with these dependencies:
  express@4.18.2, @prisma/client@5.7.1, dotenv@16.3.1, cors@2.8.5, 
  helmet@7.1.0, express-rate-limit@7.1.5, natural@6.10.2, 
  axios@1.6.5, winston@3.11.0

- Dev dependencies:
  nodemon@3.0.2, jest@29.7.0, supertest@6.3.3, prisma@5.7.1, 
  eslint@8.56.0, prettier@3.1.1

- Folder structure:
  src/config/
  src/controllers/
  src/services/
  src/utils/
  src/middleware/

- Scripts in package.json:
  "start": "node src/server.js"
  "dev": "nodemon src/server.js"
  "test": "jest --coverage"
  "prisma:generate": "prisma generate"
  "prisma:migrate": "prisma migrate dev"
  "prisma:seed": "node prisma/seed.js"

Create the package.json file.
```

**After BlackboxAI responds:**
1. Copy the package.json to `/backend/package.json`
2. Run: `cd backend && npm install`
3. Commit: `git add backend/package.json && git commit -m "chore(backend): initialize Node.js project with dependencies"`

---

#### Prompt 2: Environment Configuration
```
Create a configuration loader for a Node.js Express API.

File: src/config/env.js

Requirements:
- Load environment variables using dotenv
- Validate that DATABASE_URL exists
- Export a config object with these properties:
  - env (NODE_ENV, default: 'development')
  - port (PORT, default: 3000)
  - apiVersion (API_VERSION, default: 'v1')
  - database: { url }
  - sbertService: { url, timeout, retryAttempts }
  - rateLimit: { windowMs, max }
  - cors: { origin, credentials }
  - logging: { level, file }
  - similarity: { tier2Threshold: 0.60, tier3TimeWindowHours: 48 }

Also create a .env.example file with all required variables.
```

**After BlackboxAI responds:**
1. Save to `backend/src/config/env.js` and `backend/.env.example`
2. Create `backend/.env` with your actual values
3. Test: `cd backend && node -e "const cfg = require('./src/config/env.js'); console.log(cfg)"`
4. Commit: `git add backend/src/config/ backend/.env.example && git commit -m "feat(backend): add environment configuration loader"`

---

#### Prompt 3: Text Preprocessing Utility
```
Create a text preprocessing utility for NLP similarity algorithms using the 'natural' library.

File: src/utils/preprocessing.js

Functions needed:
1. preprocessText(text)
   - Lowercase the text
   - Tokenize using natural.WordTokenizer
   - Remove stop words (use natural.stopwords + custom: 'study', 'research', 'investigation', 'assessment', 'analysis')
   - Stem tokens using natural.PorterStemmer
   - Return object with: { original, tokens, filteredTokens, stemmedTokens, wordCount, uniqueWords }

2. countWords(text)
   - Split on whitespace
   - Return word count

Include JSDoc comments for both functions.
```

**After BlackboxAI responds:**
1. Save to `backend/src/utils/preprocessing.js`
2. Test manually or ask BlackboxAI: "Create unit tests for preprocessing.js"
3. Commit: `git commit -m "feat(backend): implement text preprocessing utilities"`

---

#### Prompt 4: Jaccard Similarity Algorithm
```
Create a Jaccard similarity service using the preprocessing utilities.

File: src/services/jaccard.service.js

Implement two functions:

1. calculateJaccard(text1, text2)
   - Preprocess both texts
   - Get unique words (stemmed tokens) as sets
   - Calculate intersection and union
   - Return: { score: number (0-1, rounded to 3 decimals), matchedKeywords: array }

2. calculateBatch(queryText, topics)
   - topics is an array of { id, title }
   - Calculate Jaccard for queryText against each topic.title
   - Return array of { topicId, title, score, matchedKeywords }

Include JSDoc comments and proper error handling.
```

**After BlackboxAI responds:**
1. Save to `backend/src/services/jaccard.service.js`
2. Create unit tests: "Create Jest unit tests for jaccard.service.js"
3. Run tests: `npm test`
4. Commit: `git commit -m "feat(backend): implement Jaccard similarity algorithm"`

---

### **Phase 2: Database Setup (Week 1)**

#### Prompt 5: Prisma Schema
```
Create a Prisma schema for a PostgreSQL database with pgvector extension.

File: prisma/schema.prisma

Requirements:
- Enable postgresqlExtensions preview feature
- Enable vector extension
- Define 3 models:

1. HistoricalTopic
   - id (Int, autoincrement, primary key)
   - title (String, Text)
   - keywords (String, optional, Text)
   - sessionYear (String, mapped to "session_year")
   - supervisorName (String, mapped to "supervisor_name")
   - category (String, optional)
   - embedding (Unsupported("vector(384)"), optional)
   - createdAt, updatedAt (DateTime)
   - indexes on: category, sessionYear, createdAt
   - table name: "historical_topics"

2. CurrentSessionTopic
   - Similar structure but with: approvedDate, studentId
   - table name: "current_session_topics"

3. UnderReviewTopic
   - Similar but with: reviewStartedAt, reviewingLecturer
   - index on: reviewStartedAt
   - table name: "under_review_topics"

Use snake_case for database column names with @map().
```

**After BlackboxAI responds:**
1. Save to `backend/prisma/schema.prisma`
2. Generate client: `npx prisma generate`
3. Create migration: `npx prisma migrate dev --name init`
4. Commit: `git commit -m "feat(database): create Prisma schema with pgvector support"`

---

### **Phase 3: SBERT Service (Week 1)**

#### Prompt 6: SBERT FastAPI Service
```
Create a Python FastAPI microservice for SBERT embeddings.

File: app.py

Requirements:
- Use FastAPI and sentence-transformers library
- Load model: "sentence-transformers/all-MiniLM-L6-v2"
- Implement two endpoints:

1. POST /embed
   - Request body: { "text": string }
   - Generate 384-dimensional embedding
   - Response: { "embedding": float[], "dimension": 384 }

2. GET /health
   - Response: { "status": "healthy", "model": "all-MiniLM-L6-v2" }

Include:
- CORS middleware (allow all origins)
- Error handling
- Logging

Also create requirements.txt with:
fastapi==0.109.0
uvicorn==0.27.0
sentence-transformers==2.2.2
```

**After BlackboxAI responds:**
1. Save to `sbert-service/app.py` and `sbert-service/requirements.txt`
2. Create venv: `cd sbert-service && python3 -m venv venv && source venv/bin/activate`
3. Install: `pip install -r requirements.txt`
4. Test: `uvicorn app:app --port 8000` then `curl http://localhost:8000/health`
5. Commit: `git commit -m "feat(sbert): implement FastAPI embedding service"`

---

### **Phase 4: API Endpoint (Week 3-4)**

#### Prompt 7: Main Similarity Controller
```
Create the main API controller for topic similarity checking.

File: src/controllers/similarity.controller.js

Function: checkSimilarity(req, res, next)

Steps:
1. Extract topic and keywords from req.body
2. Fetch all topics from 3 tables in parallel using Prisma:
   - historical_topics (all records)
   - current_session_topics (all records)
   - under_review_topics (only last 48 hours: WHERE review_started_at > NOW() - INTERVAL '48 hours')
3. Parse pgvector embeddings (come as strings, need to parse to arrays)
4. Run 3 algorithms in parallel:
   - jaccardService.calculateBatch()
   - tfidfService.calculateTfIdfSimilarity()
   - sbertService.calculateSbertSimilarities() (with try-catch for graceful degradation)
5. Combine results
6. Filter into 3 tiers:
   - Tier 1: Top 5 historical topics
   - Tier 2: Current session topics with score ≥0.60
   - Tier 3: Under review topics with score ≥0.60
7. Calculate overall risk (LOW/MEDIUM/HIGH)
8. Return JSON response

Use Prisma raw queries for pgvector: prisma.$queryRaw`SELECT ... embedding::text as embedding FROM ...`

Include proper error handling and Winston logging.
```

**After BlackboxAI responds:**
1. Save to `backend/src/controllers/similarity.controller.js`
2. Create integration test
3. Test with Postman/curl
4. Commit: `git commit -m "feat(api): implement main similarity endpoint"`
5. Tag: `git tag -a v0.7.0 -m "Main API endpoint functional"`

---

### **Phase 5: Frontend (Week 5-6)**

#### Prompt 8: React Topic Input Form
```
Create a React component for topic input with real-time validation.

File: src/components/features/TopicInput/TopicForm.jsx

Requirements:
- Text input for topic (textarea)
- Real-time word counter (7-24 words required)
- Real-time character counter (50-180 chars guideline)
- Visual feedback:
  - Red border if <7 or >24 words
  - Green border if valid
- Submit button (disabled if invalid)
- Loading state during API call
- Error handling

Use Tailwind CSS classes for styling.
Include PropTypes for type checking.
```

**After BlackboxAI responds:**
1. Save to `frontend/src/components/features/TopicInput/TopicForm.jsx`
2. Test in browser
3. Commit: `git commit -m "feat(frontend): create topic input form with validation"`

---

## 📝 **Prompt Template Pattern**

For each feature, follow this structure:

```
[CONTEXT]
Create [type of code] for [purpose].

[FILE PATH]
File: path/to/file.js

[REQUIREMENTS]
- Requirement 1
- Requirement 2
- Requirement 3

[TECHNICAL DETAILS]
- Use library X
- Implement pattern Y
- Handle edge case Z

[ADDITIONAL]
Include JSDoc comments, error handling, and [specific requirements].
```

---

## ⚠️ **Important Reminders**

1. **One Feature at a Time:** Don't ask BlackboxAI to build the entire app at once
2. **Test Before Committing:** Always test generated code before git commit
3. **Review Code Quality:** Check for proper error handling, logging, comments
4. **Commit Frequently:** After each working feature (not after each prompt)
5. **Use Semantic Commits:** `feat:`, `fix:`, `test:`, `docs:`, etc.
6. **Create Tags at Milestones:** After v0.5.0, v0.7.0, v1.0.0, etc.

---

## 🎯 **Week-by-Week Prompt Plan**

### Week 1: Foundation
- [ ] Prompt 1: Backend package.json
- [ ] Prompt 2: Environment config
- [ ] Prompt 3: Text preprocessing
- [ ] Prompt 5: Prisma schema
- [ ] Prompt 6: SBERT service

### Week 2: Algorithms
- [ ] Prompt 4: Jaccard algorithm
- [ ] TF-IDF algorithm (similar prompt)
- [ ] SBERT integration service
- [ ] Unit tests for all algorithms

### Week 3-4: API
- [ ] Prompt 7: Main controller
- [ ] Validation middleware
- [ ] Error handling
- [ ] Integration tests

### Week 5-6: Frontend
- [ ] React setup (Vite)
- [ ] Prompt 8: Topic form
- [ ] Results display component
- [ ] Risk banner component
- [ ] API integration

### Week 7-8: Testing & Polish
- [ ] E2E tests
- [ ] Bug fixes
- [ ] Documentation

### Week 9-10: Deployment
- [ ] Deploy to Render
- [ ] Deploy to Vercel
- [ ] Final testing

---

**Remember:** BlackboxAI is your coding assistant, but YOU are the project manager!
