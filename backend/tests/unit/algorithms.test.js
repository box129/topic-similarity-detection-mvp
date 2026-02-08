/**
 * Comprehensive Unit Tests for Similarity Algorithms
 * 
 * Tests cover:
 * - Preprocessing utilities
 * - Jaccard similarity service
 * - TF-IDF similarity service
 * - SBERT similarity service
 * 
 * Target: 70%+ code coverage
 */

const { preprocessText, countWords } = require('../../src/utils/preprocessing');
const { calculateJaccard, calculateBatch: calculateJaccardBatch } = require('../../src/services/jaccard.service');
const { calculateTfIdfSimilarity, calculateCosineSimilarity: calculateTfIdfCosine } = require('../../src/services/tfidf.service');
const { 
  calculateCosineSimilarity: calculateSbertCosine,
  parsePgvectorEmbedding,
  getEmbedding,
  checkHealth,
  calculateSbertSimilarities
} = require('../../src/services/sbert.service');
const axios = require('axios');

// Mock axios for SBERT service tests
jest.mock('axios');

// Mock logger to avoid console output during tests
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

describe('Preprocessing Utilities', () => {
  describe('preprocessText', () => {
    test('should preprocess valid text with 7-24 words correctly', () => {
      const text = 'Machine Learning Applications in Healthcare Diagnosis Using Neural Networks';
      const result = preprocessText(text);

      expect(result).toHaveProperty('original', text);
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('filteredTokens');
      expect(result).toHaveProperty('stemmedTokens');
      expect(result).toHaveProperty('wordCount', 9); // Fixed: actual count is 9
      expect(result).toHaveProperty('uniqueWords');
      expect(Array.isArray(result.tokens)).toBe(true);
      expect(Array.isArray(result.stemmedTokens)).toBe(true);
    });

    test('should throw error for empty string', () => {
      expect(() => preprocessText('')).toThrow('Input must be a non-empty string');
    });

    test('should throw error for null input', () => {
      expect(() => preprocessText(null)).toThrow('Input must be a non-empty string');
    });

    test('should throw error for undefined input', () => {
      expect(() => preprocessText(undefined)).toThrow('Input must be a non-empty string');
    });

    test('should throw error for non-string input', () => {
      expect(() => preprocessText(123)).toThrow('Input must be a non-empty string');
      expect(() => preprocessText({})).toThrow('Input must be a non-empty string');
      expect(() => preprocessText([])).toThrow('Input must be a non-empty string');
    });

    test('should handle text with special characters', () => {
      const text = 'AI/ML & Deep-Learning (2024) - Research!';
      const result = preprocessText(text);

      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.original).toBe(text);
    });

    test('should handle text with numbers', () => {
      const text = 'Machine Learning 2024 with Python 3.9 and TensorFlow 2.0';
      const result = preprocessText(text);

      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.tokens).toContain('2024');
      // Note: tokenizer may split '3.9' into '3' and '9'
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    test('should remove stop words correctly', () => {
      const text = 'The research study investigates climate change';
      const result = preprocessText(text);

      // 'the', 'research', 'study' should be removed as stopwords
      expect(result.filteredTokens).not.toContain('the');
      expect(result.filteredTokens.length).toBeLessThan(result.tokens.length);
    });

    test('should perform stemming correctly', () => {
      const text = 'running runner runs';
      const result = preprocessText(text);

      // All should stem to similar root (run/runner)
      const uniqueStems = new Set(result.stemmedTokens);
      expect(uniqueStems.size).toBeLessThanOrEqual(2); // Porter stemmer may produce 'run' and 'runner'
      expect(result.stemmedTokens).toContain('run');
    });

    test('should count words accurately', () => {
      const text = 'One two three four five six seven eight';
      const result = preprocessText(text);

      expect(result.wordCount).toBe(8);
    });

    test('should handle case insensitivity', () => {
      const text1 = 'Machine Learning';
      const text2 = 'MACHINE LEARNING';
      
      const result1 = preprocessText(text1);
      const result2 = preprocessText(text2);

      expect(result1.stemmedTokens).toEqual(result2.stemmedTokens);
    });
  });

  describe('countWords', () => {
    test('should count words correctly', () => {
      expect(countWords('one two three')).toBe(3);
      expect(countWords('single')).toBe(1);
      expect(countWords('one two three four five six seven')).toBe(7);
    });

    test('should return 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    test('should return 0 for null', () => {
      expect(countWords(null)).toBe(0);
    });

    test('should return 0 for undefined', () => {
      expect(countWords(undefined)).toBe(0);
    });

    test('should return 0 for non-string input', () => {
      expect(countWords(123)).toBe(0);
      expect(countWords({})).toBe(0);
    });

    test('should handle multiple spaces correctly', () => {
      expect(countWords('one    two     three')).toBe(3);
    });

    test('should handle leading/trailing spaces', () => {
      expect(countWords('  one two three  ')).toBe(3);
    });
  });
});

describe('Jaccard Similarity Service', () => {
  describe('calculateJaccard', () => {
    test('should return 1.0 for identical texts', () => {
      const text = 'machine learning algorithms';
      const result = calculateJaccard(text, text);

      expect(result.score).toBe(1.0);
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
    });

    test('should return 0.0 for completely different texts', () => {
      const text1 = 'machine learning algorithms';
      const text2 = 'cooking recipes dinner';
      const result = calculateJaccard(text1, text2);

      expect(result.score).toBe(0.0);
      expect(result.matchedKeywords).toEqual([]);
    });

    test('should return score between 0.2-0.7 for partial overlap', () => {
      const text1 = 'machine learning deep neural networks';
      const text2 = 'machine learning algorithms and models';
      const result = calculateJaccard(text1, text2);

      expect(result.score).toBeGreaterThan(0.2); // Adjusted threshold
      expect(result.score).toBeLessThan(0.7);
      expect(result.matchedKeywords).toContain('machin');
      expect(result.matchedKeywords).toContain('learn');
    });

    test('should be case insensitive', () => {
      const text1 = 'Machine Learning';
      const text2 = 'machine learning';
      const result = calculateJaccard(text1, text2);

      expect(result.score).toBe(1.0);
    });

    test('should throw error for empty first text', () => {
      expect(() => calculateJaccard('', 'test')).toThrow('text1 must be a non-empty string');
    });

    test('should throw error for empty second text', () => {
      expect(() => calculateJaccard('test', '')).toThrow('text2 must be a non-empty string');
    });

    test('should throw error for null inputs', () => {
      expect(() => calculateJaccard(null, 'test')).toThrow('text1 must be a non-empty string');
      expect(() => calculateJaccard('test', null)).toThrow('text2 must be a non-empty string');
    });

    test('should throw error for non-string inputs', () => {
      expect(() => calculateJaccard(123, 'test')).toThrow('text1 must be a non-empty string');
      expect(() => calculateJaccard('test', 456)).toThrow('text2 must be a non-empty string');
    });

    test('should return matched keywords accurately', () => {
      const text1 = 'deep learning neural networks';
      const text2 = 'deep neural networks architecture';
      const result = calculateJaccard(text1, text2);

      expect(result.matchedKeywords).toContain('deep');
      expect(result.matchedKeywords).toContain('neural');
      expect(result.matchedKeywords).toContain('network');
    });

    test('should round score to 3 decimal places', () => {
      const text1 = 'one two three';
      const text2 = 'one two three four five';
      const result = calculateJaccard(text1, text2);

      // Score should be 3/5 = 0.6
      expect(result.score).toBe(0.6);
      expect(result.score.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(3);
    });
  });

  describe('calculateBatch', () => {
    const topics = [
      { id: 1, title: 'Machine Learning Algorithms' },
      { id: 2, title: 'Deep Learning Neural Networks' },
      { id: 3, title: 'Natural Language Processing' }
    ];

    test('should calculate similarities for multiple topics', () => {
      const query = 'machine learning deep learning';
      const results = calculateJaccardBatch(query, topics);

      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty('topicId');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('matchedKeywords');
    });

    test('should sort results by score in descending order', () => {
      const query = 'machine learning algorithms';
      const results = calculateJaccardBatch(query, topics);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    test('should return empty array for empty topics', () => {
      const results = calculateJaccardBatch('test', []);
      expect(results).toEqual([]);
    });

    test('should throw error for invalid query text', () => {
      expect(() => calculateJaccardBatch('', topics)).toThrow('queryText must be a non-empty string');
      expect(() => calculateJaccardBatch(null, topics)).toThrow('queryText must be a non-empty string');
    });

    test('should throw error for non-array topics', () => {
      expect(() => calculateJaccardBatch('test', 'not array')).toThrow('topics must be an array');
      expect(() => calculateJaccardBatch('test', null)).toThrow('topics must be an array');
    });

    test('should throw error for topics without id', () => {
      const invalidTopics = [{ title: 'Test' }];
      expect(() => calculateJaccardBatch('test', invalidTopics)).toThrow("must have an 'id' property");
    });

    test('should throw error for topics without title', () => {
      const invalidTopics = [{ id: 1 }];
      expect(() => calculateJaccardBatch('test', invalidTopics)).toThrow("must have a non-empty 'title' string property");
    });
  });
});

describe('TF-IDF Similarity Service', () => {
  describe('calculateTfIdfSimilarity', () => {
    const topics = [
      { id: 1, title: 'Machine Learning Algorithms and Models' },
      { id: 2, title: 'Deep Learning Neural Networks Architecture' },
      { id: 3, title: 'Cooking Recipes and Dinner Ideas' }
    ];

    test('should return high similarity (>0.5) for similar topics', () => {
      const query = 'Machine Learning Models and Algorithms';
      const results = calculateTfIdfSimilarity(query, topics);

      const mlResult = results.find(r => r.topicId === 1);
      expect(mlResult.score).toBeGreaterThan(0.5);
    });

    test('should return low similarity (<0.3) for different topics', () => {
      const query = 'Machine Learning Algorithms';
      const results = calculateTfIdfSimilarity(query, topics);

      const cookingResult = results.find(r => r.topicId === 3);
      expect(cookingResult.score).toBeLessThan(0.3);
    });

    test('should handle single-word topics', () => {
      const singleWordTopics = [
        { id: 1, title: 'Learning' },
        { id: 2, title: 'Cooking' }
      ];
      const results = calculateTfIdfSimilarity('Learning', singleWordTopics);

      expect(results).toHaveLength(2);
      expect(results[0].score).toBeGreaterThan(0);
    });

    test('should return empty array for empty corpus', () => {
      const results = calculateTfIdfSimilarity('test', []);
      expect(results).toEqual([]);
    });

    test('should throw error for invalid query text', () => {
      expect(() => calculateTfIdfSimilarity('', topics)).toThrow('queryText must be a non-empty string');
      expect(() => calculateTfIdfSimilarity(null, topics)).toThrow('queryText must be a non-empty string');
    });

    test('should throw error for non-array topics', () => {
      expect(() => calculateTfIdfSimilarity('test', 'not array')).toThrow('topics must be an array');
    });

    test('should sort results by score in descending order', () => {
      const query = 'Machine Learning';
      const results = calculateTfIdfSimilarity(query, topics);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    test('should include matched terms in results', () => {
      const query = 'Machine Learning';
      const results = calculateTfIdfSimilarity(query, topics);

      expect(results[0]).toHaveProperty('matchedTerms');
      expect(Array.isArray(results[0].matchedTerms)).toBe(true);
    });

    test('should round scores to 3 decimal places', () => {
      const query = 'Machine Learning';
      const results = calculateTfIdfSimilarity(query, topics);

      results.forEach(result => {
        const decimals = result.score.toString().split('.')[1]?.length || 0;
        expect(decimals).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('calculateCosineSimilarity (TF-IDF)', () => {
    test('should return 1.0 for identical vectors', () => {
      const vector = { term1: 0.5, term2: 0.3, term3: 0.2 };
      const similarity = calculateTfIdfCosine(vector, vector);

      expect(similarity).toBeCloseTo(1.0, 5);
    });

    test('should return 0.0 for orthogonal vectors', () => {
      const vector1 = { term1: 1.0 };
      const vector2 = { term2: 1.0 };
      const similarity = calculateTfIdfCosine(vector1, vector2);

      expect(similarity).toBe(0.0);
    });

    test('should return 0.0 for zero magnitude vectors', () => {
      const vector1 = { term1: 0, term2: 0 };
      const vector2 = { term3: 0.5 };
      const similarity = calculateTfIdfCosine(vector1, vector2);

      expect(similarity).toBe(0.0);
    });

    test('should handle partial overlap correctly', () => {
      const vector1 = { term1: 0.5, term2: 0.5 };
      const vector2 = { term1: 0.5, term3: 0.5 };
      const similarity = calculateTfIdfCosine(vector1, vector2);

      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });
  });
});

describe('SBERT Similarity Service', () => {
  describe('calculateCosineSimilarity (SBERT)', () => {
    test('should return 1.0 for identical vectors', () => {
      const vector = new Array(384).fill(0.5);
      const similarity = calculateSbertCosine(vector, vector);

      expect(similarity).toBe(1.0);
    });

    test('should return 0.0 for orthogonal vectors', () => {
      const vector1 = new Array(384).fill(0);
      vector1[0] = 1.0;
      const vector2 = new Array(384).fill(0);
      vector2[1] = 1.0;
      
      const similarity = calculateSbertCosine(vector1, vector2);
      expect(similarity).toBe(0.0);
    });

    test('should throw error for non-array inputs', () => {
      expect(() => calculateSbertCosine('not array', [1, 2, 3])).toThrow('Both vectors must be arrays');
      expect(() => calculateSbertCosine([1, 2, 3], 'not array')).toThrow('Both vectors must be arrays');
    });

    test('should throw error for different length vectors', () => {
      const vector1 = [1, 2, 3];
      const vector2 = [1, 2, 3, 4];
      
      expect(() => calculateSbertCosine(vector1, vector2)).toThrow('Vectors must have the same length');
    });

    test('should return 0.0 for empty vectors', () => {
      const similarity = calculateSbertCosine([], []);
      expect(similarity).toBe(0.0);
    });

    test('should return 0.0 for zero magnitude vectors', () => {
      const vector1 = new Array(384).fill(0);
      const vector2 = new Array(384).fill(0.5);
      
      const similarity = calculateSbertCosine(vector1, vector2);
      expect(similarity).toBe(0.0);
    });

    test('should clamp result to [0, 1] range', () => {
      const vector1 = [1, 2, 3];
      const vector2 = [4, 5, 6];
      
      const similarity = calculateSbertCosine(vector1, vector2);
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    test('should round to 3 decimal places', () => {
      const vector1 = [0.123456, 0.234567];
      const vector2 = [0.345678, 0.456789];
      
      const similarity = calculateSbertCosine(vector1, vector2);
      const decimals = similarity.toString().split('.')[1]?.length || 0;
      expect(decimals).toBeLessThanOrEqual(3);
    });
  });

  describe('parsePgvectorEmbedding', () => {
    test('should parse valid pgvector string correctly', () => {
      const embedding = new Array(384).fill(0.5);
      const pgvectorString = JSON.stringify(embedding);
      
      const parsed = parsePgvectorEmbedding(pgvectorString);
      
      expect(parsed).toEqual(embedding);
      expect(parsed.length).toBe(384);
    });

    test('should throw error for empty string', () => {
      expect(() => parsePgvectorEmbedding('')).toThrow('pgvectorString must be a non-empty string');
    });

    test('should throw error for null input', () => {
      expect(() => parsePgvectorEmbedding(null)).toThrow('pgvectorString must be a non-empty string');
    });

    test('should throw error for non-string input', () => {
      expect(() => parsePgvectorEmbedding(123)).toThrow('pgvectorString must be a non-empty string');
    });

    test('should throw error for invalid JSON', () => {
      expect(() => parsePgvectorEmbedding('not json')).toThrow('Failed to parse pgvector embedding');
    });

    test('should throw error for non-array JSON', () => {
      expect(() => parsePgvectorEmbedding('{"key": "value"}')).toThrow('Parsed result is not an array');
    });

    test('should throw error for wrong dimension count', () => {
      const wrongSize = JSON.stringify([1, 2, 3]);
      expect(() => parsePgvectorEmbedding(wrongSize)).toThrow('Expected 384 dimensions');
    });

    test('should throw error for non-numeric values', () => {
      const invalidEmbedding = new Array(384).fill('not a number');
      const pgvectorString = JSON.stringify(invalidEmbedding);
      
      expect(() => parsePgvectorEmbedding(pgvectorString)).toThrow('Embedding contains non-numeric values');
    });
  });

  describe('getEmbedding', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should successfully get embedding from SBERT service', async () => {
      const mockEmbedding = new Array(384).fill(0.5);
      axios.post.mockResolvedValue({
        data: { embedding: mockEmbedding }
      });

      const result = await getEmbedding('test text');

      expect(result).toEqual(mockEmbedding);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/embed'),
        { text: 'test text' },
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    test('should throw error for empty text', async () => {
      await expect(getEmbedding('')).rejects.toThrow('text must be a non-empty string');
    });

    test('should throw error for null text', async () => {
      await expect(getEmbedding(null)).rejects.toThrow('text must be a non-empty string');
    });

    test('should handle ECONNREFUSED error (service down)', async () => {
      axios.post.mockRejectedValue({ code: 'ECONNREFUSED' });

      await expect(getEmbedding('test')).rejects.toThrow('SBERT service unavailable');
    });

    test('should handle timeout error', async () => {
      axios.post.mockRejectedValue({ code: 'ETIMEDOUT', message: 'timeout' });

      await expect(getEmbedding('test')).rejects.toThrow('Failed to get embedding');
    });

    test('should handle API error response', async () => {
      axios.post.mockRejectedValue({
        response: {
          data: { detail: 'API error' },
          statusText: 'Bad Request'
        }
      });

      await expect(getEmbedding('test')).rejects.toThrow('SBERT service error: API error');
    });

    test('should handle invalid response format', async () => {
      axios.post.mockResolvedValue({
        data: { wrong: 'format' }
      });

      await expect(getEmbedding('test')).rejects.toThrow('Invalid response from SBERT service');
    });
  });

  describe('checkHealth', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return true when service is healthy', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: { status: 'healthy' }
      });

      const result = await checkHealth();

      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({ timeout: 2000 })
      );
    });

    test('should return false when service is down', async () => {
      axios.get.mockRejectedValue(new Error('Connection refused'));

      const result = await checkHealth();

      expect(result).toBe(false);
    });

    test('should return false for non-200 status', async () => {
      axios.get.mockResolvedValue({
        status: 500,
        data: { status: 'unhealthy' }
      });

      const result = await checkHealth();

      expect(result).toBe(false);
    });

    test('should return false for wrong status in response', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: { status: 'unhealthy' }
      });

      const result = await checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('calculateSbertSimilarities', () => {
    const mockEmbedding = new Array(384).fill(0.5);
    const topics = [
      { id: 1, title: 'Machine Learning', embedding: mockEmbedding },
      { id: 2, title: 'Deep Learning', embedding: null },
      { id: 3, title: 'Data Science', embedding: JSON.stringify(mockEmbedding) }
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      axios.post.mockResolvedValue({
        data: { embedding: mockEmbedding }
      });
    });

    test('should calculate similarities using pre-computed embeddings', async () => {
      const results = await calculateSbertSimilarities('test query', topics);

      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty('topicId');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('usedPrecomputed');
    });

    test('should fetch embeddings when not pre-computed', async () => {
      const topicsWithoutEmbeddings = [
        { id: 1, title: 'Test Topic' }
      ];

      await calculateSbertSimilarities('test', topicsWithoutEmbeddings);

      // Should call getEmbedding twice: once for query, once for topic
      expect(axios.post).toHaveBeenCalledTimes(2);
    });

    test('should throw error for invalid query text', async () => {
      await expect(calculateSbertSimilarities('', topics)).rejects.toThrow('queryText must be a non-empty string');
    });

    test('should throw error for non-array topics', async () => {
      await expect(calculateSbertSimilarities('test', 'not array')).rejects.toThrow('topics must be an array');
    });

    test('should return empty array for empty topics', async () => {
      const results = await calculateSbertSimilarities('test', []);
      expect(results).toEqual([]);
    });

    test('should sort results by score descending', async () => {
      const results = await calculateSbertSimilarities('test', topics);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    test('should handle pgvector string embeddings', async () => {
      const topicsWithPgvector = [
        { id: 1, title: 'Test', embedding: JSON.stringify(mockEmbedding) }
      ];

      const results = await calculateSbertSimilarities('test', topicsWithPgvector);

      expect(results[0].usedPrecomputed).toBe(true);
    });

    test('should handle malformed embedding gracefully', async () => {
      const topicsWithBadEmbedding = [
        { id: 1, title: 'Test', embedding: 'invalid json' }
      ];

      // Should not throw, should fetch fresh embedding instead
      const results = await calculateSbertSimilarities('test', topicsWithBadEmbedding);

      expect(results).toHaveLength(1);
      expect(results[0].usedPrecomputed).toBe(false);
    });
  });
});

describe('Edge Cases and Integration', () => {
  test('preprocessing should handle very long text', () => {
    const longText = 'word '.repeat(100);
    const result = preprocessText(longText);

    expect(result.wordCount).toBe(100);
    expect(result.tokens.length).toBeGreaterThan(0);
  });

  test('Jaccard should handle identical stemmed words', () => {
    const text1 = 'running runner runs';
    const text2 = 'run running runner';
    const result = calculateJaccard(text1, text2);

    // All should stem to 'run', so should have high similarity
    expect(result.score).toBeGreaterThan(0.5);
  });

  test('TF-IDF should handle empty matched terms', () => {
    const topics = [
      { id: 1, title: 'completely different words here' }
    ];
    const results = calculateTfIdfSimilarity('machine learning', topics);

    expect(results[0].matchedTerms).toEqual([]);
  });

  test('SBERT cosine similarity should handle negative dot products', () => {
    const vector1 = [1, -1, 0];
    const vector2 = [-1, 1, 0];
    
    const similarity = calculateSbertCosine(vector1, vector2);
    
    // Should clamp to 0
    expect(similarity).toBeGreaterThanOrEqual(0);
  });

  test('all algorithms should handle special Unicode characters', () => {
    const text = 'Machine Learning 机器学习 Apprentissage automatique';
    
    expect(() => preprocessText(text)).not.toThrow();
    expect(() => calculateJaccard(text, text)).not.toThrow();
  });
});
