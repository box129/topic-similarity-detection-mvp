const axios = require('axios');
const logger = require('../config/logger');

/**
 * SBERT Service for calculating semantic similarity using sentence embeddings
 * Communicates with the Python FastAPI SBERT microservice
 */

// SBERT service configuration
const SBERT_SERVICE_URL = process.env.SBERT_SERVICE_URL || 'http://localhost:8000';
const SBERT_TIMEOUT = parseInt(process.env.SBERT_TIMEOUT || '5000', 10);

/**
 * Calculate cosine similarity between two vectors
 * 
 * @param {number[]} vector1 - First embedding vector
 * @param {number[]} vector2 - Second embedding vector
 * @returns {number} Cosine similarity score (0-1)
 */
function calculateCosineSimilarity(vector1, vector2) {
  if (!Array.isArray(vector1) || !Array.isArray(vector2)) {
    throw new Error('Both vectors must be arrays');
  }

  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }

  if (vector1.length === 0) {
    return 0;
  }

  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // Calculate cosine similarity
  const similarity = dotProduct / (magnitude1 * magnitude2);

  // Clamp to [0, 1] range and round to 3 decimal places
  return Math.round(Math.max(0, Math.min(1, similarity)) * 1000) / 1000;
}

/**
 * Get embedding for a text from the SBERT microservice
 * 
 * @param {string} text - Text to get embedding for
 * @returns {Promise<number[]>} 384-dimensional embedding vector
 * @throws {Error} If SBERT service is unavailable or returns an error
 */
async function getEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('text must be a non-empty string');
  }

  try {
    const response = await axios.post(
      `${SBERT_SERVICE_URL}/embed`,
      { text },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: SBERT_TIMEOUT
      }
    );

    if (!response.data || !Array.isArray(response.data.embedding)) {
      throw new Error('Invalid response from SBERT service');
    }

    return response.data.embedding;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`SBERT service unavailable at ${SBERT_SERVICE_URL}`);
    }
    if (error.response) {
      throw new Error(`SBERT service error: ${error.response.data.detail || error.response.statusText}`);
    }
    throw new Error(`Failed to get embedding: ${error.message}`);
  }
}

/**
 * Check if SBERT service is healthy
 * 
 * @returns {Promise<boolean>} True if service is healthy, false otherwise
 */
async function checkHealth() {
  try {
    const response = await axios.get(
      `${SBERT_SERVICE_URL}/health`,
      { timeout: 2000 }
    );
    return response.status === 200 && response.data.status === 'healthy';
  } catch (error) {
    logger.warn(`SBERT service health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Calculate SBERT similarities between query text and topics
 * Uses pre-computed embeddings from database when available
 * 
 * @param {string} queryText - The query text to compare
 * @param {Array<Object>} topics - Array of topic objects with id, title, and optional embedding
 * @param {string|number} topics[].id - Topic identifier
 * @param {string} topics[].title - Topic title
 * @param {number[]|string|null} topics[].embedding - Pre-computed embedding (384-dim vector or pgvector string)
 * @returns {Promise<Array<Object>>} Array of results with SBERT scores
 * @returns {string|number} returns[].topicId - Topic identifier
 * @returns {string} returns[].title - Topic title
 * @returns {number} returns[].score - SBERT similarity score (0-1)
 * @returns {boolean} returns[].usedPrecomputed - Whether pre-computed embedding was used
 * @throws {Error} If inputs are invalid or SBERT service fails
 */
async function calculateSbertSimilarities(queryText, topics) {
  // Validate query text
  if (!queryText || typeof queryText !== 'string') {
    throw new Error('queryText must be a non-empty string');
  }

  // Validate topics array
  if (!Array.isArray(topics)) {
    throw new Error('topics must be an array');
  }

  if (topics.length === 0) {
    return [];
  }

  // Validate each topic object
  topics.forEach((topic, index) => {
    if (!topic || typeof topic !== 'object') {
      throw new Error(`Topic at index ${index} must be an object`);
    }
    if (!topic.hasOwnProperty('id')) {
      throw new Error(`Topic at index ${index} must have an 'id' property`);
    }
    if (!topic.title || typeof topic.title !== 'string') {
      throw new Error(`Topic at index ${index} must have a non-empty 'title' string property`);
    }
  });

  try {
    // Get embedding for query text
    logger.info(`Getting SBERT embedding for query: "${queryText.substring(0, 50)}..."`);
    const queryEmbedding = await getEmbedding(queryText);

    // Calculate similarities
    const results = await Promise.all(
      topics.map(async (topic) => {
        let topicEmbedding;
        let usedPrecomputed = false;

        // Check if topic has pre-computed embedding
        if (topic.embedding) {
          try {
            // Parse embedding (could be array or pgvector string)
            if (Array.isArray(topic.embedding)) {
              topicEmbedding = topic.embedding;
            } else if (typeof topic.embedding === 'string') {
              // Parse pgvector format: "[0.1, 0.2, ...]"
              topicEmbedding = JSON.parse(topic.embedding);
            }
            
            if (Array.isArray(topicEmbedding) && topicEmbedding.length === 384) {
              usedPrecomputed = true;
              logger.debug(`Using pre-computed embedding for topic ${topic.id}`);
            } else {
              topicEmbedding = null;
            }
          } catch (parseError) {
            logger.warn(`Failed to parse embedding for topic ${topic.id}: ${parseError.message}`);
            topicEmbedding = null;
          }
        }

        // If no valid pre-computed embedding, get it from SBERT service
        if (!topicEmbedding) {
          logger.debug(`Getting fresh embedding for topic ${topic.id}: "${topic.title.substring(0, 50)}..."`);
          topicEmbedding = await getEmbedding(topic.title);
        }

        // Calculate cosine similarity
        const score = calculateCosineSimilarity(queryEmbedding, topicEmbedding);

        return {
          topicId: topic.id,
          title: topic.title,
          score: score,
          usedPrecomputed: usedPrecomputed
        };
      })
    );

    // Sort by score in descending order
    results.sort((a, b) => b.score - a.score);

    logger.info(`Calculated SBERT similarities for ${results.length} topics`);
    return results;
  } catch (error) {
    logger.error(`SBERT similarity calculation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Parse pgvector embedding string to array
 * 
 * @param {string} pgvectorString - pgvector format string "[0.1, 0.2, ...]"
 * @returns {number[]} Parsed embedding array
 * @throws {Error} If parsing fails
 */
function parsePgvectorEmbedding(pgvectorString) {
  if (!pgvectorString || typeof pgvectorString !== 'string') {
    throw new Error('pgvectorString must be a non-empty string');
  }

  try {
    const parsed = JSON.parse(pgvectorString);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed result is not an array');
    }

    if (parsed.length !== 384) {
      throw new Error(`Expected 384 dimensions, got ${parsed.length}`);
    }

    // Validate all elements are numbers
    if (!parsed.every(val => typeof val === 'number' && !isNaN(val))) {
      throw new Error('Embedding contains non-numeric values');
    }

    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse pgvector embedding: ${error.message}`);
  }
}

module.exports = {
  getEmbedding,
  checkHealth,
  calculateSbertSimilarities,
  calculateCosineSimilarity,
  parsePgvectorEmbedding,
  SBERT_SERVICE_URL
};
