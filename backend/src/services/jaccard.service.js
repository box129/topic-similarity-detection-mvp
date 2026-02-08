const { preprocessText } = require('../utils/preprocessing');

/**
 * Calculate Jaccard similarity between two texts
 * 
 * @param {string} text1 - First text to compare
 * @param {string} text2 - Second text to compare
 * @returns {Object} Object containing similarity score and matched keywords
 * @returns {number} returns.score - Jaccard similarity score (0-1, rounded to 3 decimals)
 * @returns {string[]} returns.matchedKeywords - Array of matched keywords
 * @throws {Error} If inputs are invalid
 * 
 * @example
 * const result = calculateJaccard(
 *   "machine learning algorithms",
 *   "deep learning and machine learning"
 * );
 * // Returns: { score: 0.667, matchedKeywords: ['machin', 'learn'] }
 */
function calculateJaccard(text1, text2) {
  // Validate inputs
  if (!text1 || typeof text1 !== 'string') {
    throw new Error('text1 must be a non-empty string');
  }
  if (!text2 || typeof text2 !== 'string') {
    throw new Error('text2 must be a non-empty string');
  }

  try {
    // Preprocess both texts to get stemmed tokens
    const processed1 = preprocessText(text1);
    const processed2 = preprocessText(text2);

    // Get unique words (stemmed tokens) as sets
    const set1 = new Set(processed1.stemmedTokens);
    const set2 = new Set(processed2.stemmedTokens);

    // Calculate intersection (matched keywords)
    const intersection = new Set([...set1].filter(token => set2.has(token)));
    const matchedKeywords = Array.from(intersection);

    // Calculate union
    const union = new Set([...set1, ...set2]);

    // Calculate Jaccard similarity: |intersection| / |union|
    const score = union.size === 0 ? 0 : intersection.size / union.size;

    // Round to 3 decimal places
    const roundedScore = Math.round(score * 1000) / 1000;

    return {
      score: roundedScore,
      matchedKeywords: matchedKeywords
    };
  } catch (error) {
    throw new Error(`Failed to calculate Jaccard similarity: ${error.message}`);
  }
}

/**
 * Calculate Jaccard similarity for a query text against multiple topics
 * 
 * @param {string} queryText - The query text to compare
 * @param {Array<Object>} topics - Array of topic objects with id and title
 * @param {string|number} topics[].id - Topic identifier
 * @param {string} topics[].title - Topic title to compare against
 * @returns {Array<Object>} Array of results sorted by score (descending)
 * @returns {string|number} returns[].topicId - Topic identifier
 * @returns {string} returns[].title - Topic title
 * @returns {number} returns[].score - Jaccard similarity score (0-1)
 * @returns {string[]} returns[].matchedKeywords - Array of matched keywords
 * @throws {Error} If inputs are invalid
 * 
 * @example
 * const results = calculateBatch(
 *   "machine learning project",
 *   [
 *     { id: 1, title: "Deep Learning Applications" },
 *     { id: 2, title: "Machine Learning Algorithms" }
 *   ]
 * );
 * // Returns array sorted by similarity score
 */
function calculateBatch(queryText, topics) {
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
    // Calculate Jaccard similarity for each topic
    const results = topics.map(topic => {
      const similarity = calculateJaccard(queryText, topic.title);
      
      return {
        topicId: topic.id,
        title: topic.title,
        score: similarity.score,
        matchedKeywords: similarity.matchedKeywords
      };
    });

    // Sort by score in descending order (highest similarity first)
    results.sort((a, b) => b.score - a.score);

    return results;
  } catch (error) {
    throw new Error(`Failed to calculate batch Jaccard similarity: ${error.message}`);
  }
}

module.exports = {
  calculateJaccard,
  calculateBatch
};
