const { PrismaClient, Prisma } = require('@prisma/client');
const jaccardService = require('../services/jaccard.service');
const tfidfService = require('../services/tfidf.service');
const sbertService = require('../services/sbert.service');
const logger = require('../config/logger');

const prisma = new PrismaClient();

/**
 * Main controller for topic similarity checking
 * Combines Jaccard, TF-IDF, and SBERT algorithms to find similar topics
 */

/**
 * Check similarity between a new topic and existing topics in the database
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.topic - Topic title to check
 * @param {string} [req.body.keywords] - Optional keywords for the topic
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {Promise<void>} JSON response with similarity results
 */
async function checkSimilarity(req, res, next) {
  const startTime = Date.now();
  
  try {
    // 1. Extract and validate input
    const { topic, keywords } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Topic is required and must be a non-empty string'
      });
    }

    const queryText = keywords ? `${topic} ${keywords}` : topic;
    logger.info(`Checking similarity for topic: "${topic.substring(0, 50)}..."`);

    // 2. Fetch all topics from 3 tables in parallel using Prisma
    logger.info('Fetching topics from database...');
    
    const [historicalTopics, currentSessionTopics, underReviewTopics] = await Promise.all([
      // Fetch all historical topics with embeddings
      prisma.$queryRaw`
        SELECT 
          id, 
          title, 
          keywords,
          session_year,
          supervisor_name,
          category,
          embedding::text as embedding
        FROM historical_topics
        ORDER BY created_at DESC
      `,
      
      // Fetch all current session topics with embeddings
      prisma.$queryRaw`
        SELECT 
          id, 
          title, 
          keywords,
          session_year,
          supervisor_name,
          category,
          embedding::text as embedding
        FROM current_session_topics
        ORDER BY created_at DESC
      `,
      
      // Fetch under review topics from last 48 hours only
      prisma.$queryRaw`
        SELECT 
          id, 
          title, 
          keywords,
          session_year,
          supervisor_name,
          category,
          embedding::text as embedding,
          review_started_at
        FROM under_review_topics
        WHERE review_started_at > NOW() - INTERVAL '48 hours'
        ORDER BY review_started_at DESC
      `
    ]);

    logger.info(`Fetched ${historicalTopics.length} historical, ${currentSessionTopics.length} current session, ${underReviewTopics.length} under review topics`);

    // 3. Parse pgvector embeddings (come as strings, need to parse to arrays)
    const parseEmbedding = (topic) => {
      if (topic.embedding) {
        try {
          topic.embedding = JSON.parse(topic.embedding);
        } catch (error) {
          logger.warn(`Failed to parse embedding for topic ${topic.id}: ${error.message}`);
          topic.embedding = null;
        }
      }
      return topic;
    };

    const parsedHistorical = historicalTopics.map(parseEmbedding);
    const parsedCurrentSession = currentSessionTopics.map(parseEmbedding);
    const parsedUnderReview = underReviewTopics.map(parseEmbedding);

    // Combine all topics for algorithm processing
    const allTopics = [
      ...parsedHistorical.map(t => ({ ...t, source: 'historical' })),
      ...parsedCurrentSession.map(t => ({ ...t, source: 'current_session' })),
      ...parsedUnderReview.map(t => ({ ...t, source: 'under_review' }))
    ];

    if (allTopics.length === 0) {
      logger.info('No topics found in database');
      return res.json({
        topic: topic,
        keywords: keywords || null,
        results: {
          tier1_historical: [],
          tier2_current_session: [],
          tier3_under_review: []
        },
        overallRisk: 'LOW',
        message: 'No existing topics to compare against',
        processingTime: Date.now() - startTime
      });
    }

    // 4. Run 3 algorithms in parallel
    logger.info('Running similarity algorithms...');
    
    const algorithmResults = await Promise.allSettled([
      // Jaccard similarity
      Promise.resolve(jaccardService.calculateBatch(queryText, allTopics)),
      
      // TF-IDF similarity
      Promise.resolve(tfidfService.calculateTfIdfSimilarity(queryText, allTopics)),
      
      // SBERT similarity (with graceful degradation)
      sbertService.calculateSbertSimilarities(queryText, allTopics)
        .catch(error => {
          logger.warn(`SBERT service unavailable, continuing without it: ${error.message}`);
          return null; // Graceful degradation
        })
    ]);

    // Extract results
    const jaccardResults = algorithmResults[0].status === 'fulfilled' ? algorithmResults[0].value : [];
    const tfidfResults = algorithmResults[1].status === 'fulfilled' ? algorithmResults[1].value : [];
    const sbertResults = algorithmResults[2].status === 'fulfilled' ? algorithmResults[2].value : null;

    logger.info(`Algorithm results: Jaccard=${jaccardResults.length}, TF-IDF=${tfidfResults.length}, SBERT=${sbertResults ? sbertResults.length : 'N/A'}`);

    // 5. Combine results
    const combinedResults = combineAlgorithmResults(
      allTopics,
      jaccardResults,
      tfidfResults,
      sbertResults
    );

    // 6. Filter into 3 tiers
    const tier1Historical = filterTier1Historical(combinedResults, parsedHistorical);
    const tier2CurrentSession = filterTier2CurrentSession(combinedResults, parsedCurrentSession);
    const tier3UnderReview = filterTier3UnderReview(combinedResults, parsedUnderReview);

    logger.info(`Tiers: T1=${tier1Historical.length}, T2=${tier2CurrentSession.length}, T3=${tier3UnderReview.length}`);

    // 7. Calculate overall risk
    const overallRisk = calculateOverallRisk(tier1Historical, tier2CurrentSession, tier3UnderReview);

    // 8. Return JSON response
    const processingTime = Date.now() - startTime;
    logger.info(`Similarity check completed in ${processingTime}ms with risk level: ${overallRisk}`);

    res.json({
      topic: topic,
      keywords: keywords || null,
      results: {
        tier1_historical: tier1Historical,
        tier2_current_session: tier2CurrentSession,
        tier3_under_review: tier3UnderReview
      },
      overallRisk: overallRisk,
      algorithmStatus: {
        jaccard: algorithmResults[0].status === 'fulfilled',
        tfidf: algorithmResults[1].status === 'fulfilled',
        sbert: sbertResults !== null
      },
      processingTime: processingTime
    });

  } catch (error) {
    logger.error(`Similarity check failed: ${error.message}`, { stack: error.stack });
    next(error);
  }
}

/**
 * Combine results from multiple algorithms
 * 
 * @param {Array} allTopics - All topics from database
 * @param {Array} jaccardResults - Jaccard similarity results
 * @param {Array} tfidfResults - TF-IDF similarity results
 * @param {Array|null} sbertResults - SBERT similarity results (null if unavailable)
 * @returns {Array} Combined results with weighted scores
 */
function combineAlgorithmResults(allTopics, jaccardResults, tfidfResults, sbertResults) {
  // Create a map of topic ID to combined scores
  const scoresMap = new Map();

  // Initialize with all topics
  allTopics.forEach(topic => {
    scoresMap.set(topic.id, {
      topic: topic,
      jaccard: 0,
      tfidf: 0,
      sbert: 0,
      combinedScore: 0,
      matchedKeywords: [],
      matchedTerms: []
    });
  });

  // Add Jaccard scores
  jaccardResults.forEach(result => {
    const entry = scoresMap.get(result.topicId);
    if (entry) {
      entry.jaccard = result.score;
      entry.matchedKeywords = result.matchedKeywords || [];
    }
  });

  // Add TF-IDF scores
  tfidfResults.forEach(result => {
    const entry = scoresMap.get(result.topicId);
    if (entry) {
      entry.tfidf = result.score;
      entry.matchedTerms = result.matchedTerms || [];
    }
  });

  // Add SBERT scores if available
  if (sbertResults) {
    sbertResults.forEach(result => {
      const entry = scoresMap.get(result.topicId);
      if (entry) {
        entry.sbert = result.score;
        entry.usedPrecomputed = result.usedPrecomputed;
      }
    });
  }

  // Calculate weighted combined score
  // Weights: Jaccard 30%, TF-IDF 30%, SBERT 40% (if available)
  const hasSbert = sbertResults !== null;
  const results = Array.from(scoresMap.values()).map(entry => {
    let combinedScore;
    
    if (hasSbert) {
      // All three algorithms available
      combinedScore = (
        entry.jaccard * 0.30 +
        entry.tfidf * 0.30 +
        entry.sbert * 0.40
      );
    } else {
      // Only Jaccard and TF-IDF available
      combinedScore = (
        entry.jaccard * 0.50 +
        entry.tfidf * 0.50
      );
    }

    entry.combinedScore = Math.round(combinedScore * 1000) / 1000;
    return entry;
  });

  // Sort by combined score descending
  results.sort((a, b) => b.combinedScore - a.combinedScore);

  return results;
}

/**
 * Filter Tier 1: Top 5 historical topics
 * 
 * @param {Array} combinedResults - Combined algorithm results
 * @param {Array} historicalTopics - Historical topics from database
 * @returns {Array} Top 5 historical topics
 */
function filterTier1Historical(combinedResults, historicalTopics) {
  const historicalIds = new Set(historicalTopics.map(t => t.id));
  
  const tier1 = combinedResults
    .filter(result => historicalIds.has(result.topic.id))
    .slice(0, 5)
    .map(result => ({
      id: result.topic.id,
      title: result.topic.title,
      keywords: result.topic.keywords,
      sessionYear: result.topic.session_year,
      supervisorName: result.topic.supervisor_name,
      category: result.topic.category,
      scores: {
        jaccard: result.jaccard,
        tfidf: result.tfidf,
        sbert: result.sbert,
        combined: result.combinedScore
      },
      matchedKeywords: result.matchedKeywords,
      matchedTerms: result.matchedTerms
    }));

  return tier1;
}

/**
 * Filter Tier 2: Current session topics with score ≥ 0.60
 * 
 * @param {Array} combinedResults - Combined algorithm results
 * @param {Array} currentSessionTopics - Current session topics from database
 * @returns {Array} Current session topics with high similarity
 */
function filterTier2CurrentSession(combinedResults, currentSessionTopics) {
  const currentSessionIds = new Set(currentSessionTopics.map(t => t.id));
  
  const tier2 = combinedResults
    .filter(result => 
      currentSessionIds.has(result.topic.id) && 
      result.combinedScore >= 0.60
    )
    .map(result => ({
      id: result.topic.id,
      title: result.topic.title,
      keywords: result.topic.keywords,
      sessionYear: result.topic.session_year,
      supervisorName: result.topic.supervisor_name,
      category: result.topic.category,
      studentId: result.topic.student_id,
      scores: {
        jaccard: result.jaccard,
        tfidf: result.tfidf,
        sbert: result.sbert,
        combined: result.combinedScore
      },
      matchedKeywords: result.matchedKeywords,
      matchedTerms: result.matchedTerms
    }));

  return tier2;
}

/**
 * Filter Tier 3: Under review topics with score ≥ 0.60
 * 
 * @param {Array} combinedResults - Combined algorithm results
 * @param {Array} underReviewTopics - Under review topics from database
 * @returns {Array} Under review topics with high similarity
 */
function filterTier3UnderReview(combinedResults, underReviewTopics) {
  const underReviewIds = new Set(underReviewTopics.map(t => t.id));
  
  const tier3 = combinedResults
    .filter(result => 
      underReviewIds.has(result.topic.id) && 
      result.combinedScore >= 0.60
    )
    .map(result => ({
      id: result.topic.id,
      title: result.topic.title,
      keywords: result.topic.keywords,
      sessionYear: result.topic.session_year,
      supervisorName: result.topic.supervisor_name,
      category: result.topic.category,
      reviewingLecturer: result.topic.reviewing_lecturer,
      reviewStartedAt: result.topic.review_started_at,
      scores: {
        jaccard: result.jaccard,
        tfidf: result.tfidf,
        sbert: result.sbert,
        combined: result.combinedScore
      },
      matchedKeywords: result.matchedKeywords,
      matchedTerms: result.matchedTerms
    }));

  return tier3;
}

/**
 * Calculate overall risk level based on tier results
 * 
 * @param {Array} tier1 - Tier 1 results
 * @param {Array} tier2 - Tier 2 results
 * @param {Array} tier3 - Tier 3 results
 * @returns {string} Risk level: 'LOW', 'MEDIUM', or 'HIGH'
 */
function calculateOverallRisk(tier1, tier2, tier3) {
  // HIGH risk conditions:
  // - Any tier 2 or tier 3 matches (current session or under review)
  // - Tier 1 has matches with combined score >= 0.80
  
  if (tier2.length > 0 || tier3.length > 0) {
    return 'HIGH';
  }

  if (tier1.length > 0 && tier1[0].scores.combined >= 0.80) {
    return 'HIGH';
  }

  // MEDIUM risk conditions:
  // - Tier 1 has matches with combined score >= 0.60
  
  if (tier1.length > 0 && tier1[0].scores.combined >= 0.60) {
    return 'MEDIUM';
  }

  // LOW risk: Everything else
  return 'LOW';
}

module.exports = {
  checkSimilarity
};
