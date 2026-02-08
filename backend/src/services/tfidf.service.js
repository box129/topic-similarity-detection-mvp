const natural = require('natural');
const { preprocessText } = require('../utils/preprocessing');

/**
 * TF-IDF Service for calculating text similarity using Term Frequency-Inverse Document Frequency
 */

/**
 * Calculate TF-IDF similarity between a query and multiple documents
 * 
 * @param {string} queryText - The query text to compare
 * @param {Array<Object>} topics - Array of topic objects with id and title
 * @param {string|number} topics[].id - Topic identifier
 * @param {string} topics[].title - Topic title to compare against
 * @returns {Array<Object>} Array of results with TF-IDF scores
 * @returns {string|number} returns[].topicId - Topic identifier
 * @returns {string} returns[].title - Topic title
 * @returns {number} returns[].score - TF-IDF similarity score (0-1)
 * @returns {string[]} returns[].matchedTerms - Array of matched terms
 * @throws {Error} If inputs are invalid
 */
function calculateTfIdfSimilarity(queryText, topics) {
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
    // Create TF-IDF instance
    const tfidf = new natural.TfIdf();

    // Preprocess query text
    const processedQuery = preprocessText(queryText);
    const queryTokens = processedQuery.stemmedTokens.join(' ');

    // Add query as first document
    tfidf.addDocument(queryTokens);

    // Add all topic titles as documents and preprocess them
    const processedTopics = topics.map(topic => {
      const processed = preprocessText(topic.title);
      const tokens = processed.stemmedTokens.join(' ');
      tfidf.addDocument(tokens);
      return {
        ...topic,
        processedTokens: processed.stemmedTokens
      };
    });

    // Calculate similarity scores
    const results = processedTopics.map((topic, index) => {
      // Get TF-IDF terms for the query document (index 0)
      const queryTerms = {};
      tfidf.listTerms(0).forEach(item => {
        queryTerms[item.term] = item.tfidf;
      });

      // Get TF-IDF terms for the topic document (index + 1, since query is at 0)
      const topicTerms = {};
      tfidf.listTerms(index + 1).forEach(item => {
        topicTerms[item.term] = item.tfidf;
      });

      // Calculate cosine similarity between query and topic
      const score = calculateCosineSimilarity(queryTerms, topicTerms);

      // Find matched terms (terms present in both query and topic)
      const matchedTerms = Object.keys(queryTerms).filter(term => 
        topicTerms.hasOwnProperty(term)
      );

      return {
        topicId: topic.id,
        title: topic.title,
        score: Math.round(score * 1000) / 1000, // Round to 3 decimal places
        matchedTerms: matchedTerms
      };
    });

    // Sort by score in descending order
    results.sort((a, b) => b.score - a.score);

    return results;
  } catch (error) {
    throw new Error(`Failed to calculate TF-IDF similarity: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 * 
 * @param {Object} vector1 - First TF-IDF vector (term -> score mapping)
 * @param {Object} vector2 - Second TF-IDF vector (term -> score mapping)
 * @returns {number} Cosine similarity score (0-1)
 */
function calculateCosineSimilarity(vector1, vector2) {
  // Get all unique terms
  const allTerms = new Set([
    ...Object.keys(vector1),
    ...Object.keys(vector2)
  ]);

  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  allTerms.forEach(term => {
    const val1 = vector1[term] || 0;
    const val2 = vector2[term] || 0;

    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}

module.exports = {
  calculateTfIdfSimilarity,
  calculateCosineSimilarity
};
