# SEED TESTING GUIDE

## Section 1 — Setup & Seeding

### How to run each seed file and in what order

Run the seed files in ascending order of size to build up the dataset incrementally:

1. **seed_100.csv** (100 rows) - Start here for initial testing
   ```bash
   cd backend/prisma
   node seed.js seed_100.csv
   ```

2. **seed_500.csv** (500 rows) - Add more data for richer similarity results
   ```bash
   node seed.js seed_500.csv
   ```

3. **seed_1000.csv** (1000 rows) - Full dataset for comprehensive testing
   ```bash
   node seed.js seed_1000.csv
   ```

### How to verify the data was inserted correctly

After seeding, verify the data with these SQL queries in your PostgreSQL database:

```sql
-- Check total count
SELECT COUNT(*) FROM historical_topics;

-- Check category distribution
SELECT category, COUNT(*) FROM historical_topics GROUP BY category ORDER BY COUNT(*) DESC;

-- Check for duplicates (should return 0 rows)
SELECT title, COUNT(*) FROM historical_topics GROUP BY title HAVING COUNT(*) > 1;

-- Sample some rows
SELECT title, keywords, category FROM historical_topics LIMIT 5;
```

### How to reset/clear the database between test runs

To clear all data between test runs:

```sql
-- Delete all historical_topics
DELETE FROM historical_topics;

-- Reset auto-increment ID (optional)
ALTER SEQUENCE historical_topics_id_seq RESTART WITH 1;
```

Or drop and recreate the database:

```bash
cd backend
npx prisma db push --force-reset
```

## Section 2 — Test Cases

Test each dataset size (100, 500, 1000 rows) with these scenarios. Use the frontend at `http://localhost:5173` or API calls to `/api/similarity/check`.

### An exact match test
**Input:** Copy a title directly from the CSV
- Topic: "Epidemiology of Road Traffic Injuries and Fatalities in Urban Communities of Southwest Nigeria"
- Keywords: "road traffic injuries, fatalities, urban, epidemiology, Southwest"

**Expected Results:**
- **100 rows:** HIGH risk (exact match in Tier 1)
- **500/1000 rows:** HIGH risk (exact match in Tier 1)

### A near match test
**Input:** Slightly reword a title from the CSV
- Topic: "Epidemiology of Road Traffic Accidents and Deaths in Urban Areas of Southwest Nigeria"
- Keywords: "road traffic accidents, deaths, urban areas, epidemiology, Southwest Nigeria"

**Expected Results:**
- **100 rows:** MEDIUM risk (semantic similarity via SBERT)
- **500/1000 rows:** MEDIUM-HIGH risk (better semantic matching with more data)

### A completely unrelated topic test
**Input:** Topic with no relation to public health
- Topic: "Machine Learning Algorithms for Stock Market Prediction"
- Keywords: "machine learning, algorithms, stock market, prediction"

**Expected Results:**
- **All sizes:** LOW risk (no meaningful matches)

### A cross-category test
**Input:** Topic that overlaps Infectious Diseases and Environmental Health
- Topic: "Impact of Environmental Factors on Malaria Transmission in Rural Areas"
- Keywords: "environmental factors, malaria, transmission, rural areas"

**Expected Results:**
- **100 rows:** MEDIUM risk (limited cross-category matches)
- **500/1000 rows:** MEDIUM-HIGH risk (richer cross-category connections)

## Section 3 — Known Algorithm Limitations

### Jaccard
Very fast but inaccurate with synonyms. Common words in Nigerian public health topics ("assessment", "study", "Nigeria", "Osun") appear across most titles and will artificially inflate similarity scores between unrelated topics.

### TF-IDF
Reliable at 100–500 rows but response time increases at 1000 rows (expect 2–5 seconds). Since all topics are public health domain, rare words lose discriminating power, reducing accuracy.

### SBERT
Most semantically accurate but slowest. Expected response times: ~instant at 100 rows, 3–8 seconds at 500 rows, 10–20 seconds at 1000 rows on CPU-only hardware (no GPU). First request after service start is always slower due to model loading into memory.

### pgvector
Vector similarity search only works for rows that have embeddings. CSV-imported seed data has no embeddings — the system will fall back to text matching for those rows silently.

### 60% threshold
With only 100 rows in the database, Tier 2 and Tier 3 matches may be sparse or empty. Results become richer and more representative at 500–1000 rows.

### Cold start
All three services (backend, SBERT, frontend) must be running simultaneously for full accuracy. SBERT degradation is silent — results appear normal but are less accurate.

## Section 4 — Demo Recommendations

### Dataset Recommendations
- **Use 100-row dataset for live demos** (fastest, most predictable)
- **Use 500 and 1000 row datasets for scalability documentation only**

### Suggested Demo Flow
1. Start all services (backend, SBERT, frontend)
2. Seed with 100 rows
3. Show exact match (HIGH risk)
4. Show near match (MEDIUM risk)
5. Show unrelated topic (LOW risk)
6. Demonstrate cross-category overlap
7. Mention scalability with larger datasets (without running them live)