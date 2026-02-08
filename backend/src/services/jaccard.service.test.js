const { calculateJaccard, calculateBatch } = require('./jaccard.service');

describe('Jaccard Similarity Service', () => {
  describe('calculateJaccard', () => {
    test('should calculate Jaccard similarity for identical texts', () => {
      const text1 = 'machine learning algorithms';
      const text2 = 'machine learning algorithms';
      
      const result = calculateJaccard(text1, text2);
      
      expect(result.score).toBe(1.000);
      expect(result.matchedKeywords).toEqual(expect.arrayContaining(['machin', 'learn', 'algorithm']));
      expect(result.matchedKeywords.length).toBe(3);
    });

    test('should calculate Jaccard similarity for partially matching texts', () => {
      const text1 = 'machine learning algorithms';
      const text2 = 'deep learning and machine learning';
      
      const result = calculateJaccard(text1, text2);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(1);
      expect(result.matchedKeywords).toContain('machin');
      expect(result.matchedKeywords).toContain('learn');
    });

    test('should return 0 score for completely different texts', () => {
      const text1 = 'machine learning';
      const text2 = 'database systems';
      
      const result = calculateJaccard(text1, text2);
      
      expect(result.score).toBe(0);
      expect(result.matchedKeywords).toEqual([]);
    });

    test('should handle texts with different word counts', () => {
      const text1 = 'AI';
      const text2 = 'artificial intelligence machine learning deep learning neural networks';
      
      const result = calculateJaccard(text1, text2);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result).toHaveProperty('matchedKeywords');
    });

    test('should round score to 3 decimal places', () => {
      const text1 = 'machine learning algorithms and data science';
      const text2 = 'deep learning machine learning';
      
      const result = calculateJaccard(text1, text2);
      
      // Check that score has at most 3 decimal places
      const decimalPlaces = (result.score.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(3);
    });

    test('should handle texts with punctuation', () => {
      const text1 = 'Machine Learning, AI & Data Science!';
      const text2 = 'machine learning and artificial intelligence';
      
      const result = calculateJaccard(text1, text2);
      
      expect(result.score).toBeGreaterThan(0);
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
    });

    test('should handle case-insensitive comparison', () => {
      const text1 = 'MACHINE LEARNING';
      const text2 = 'machine learning';
      
      const result = calculateJaccard(text1, text2);
      
      expect(result.score).toBe(1.000);
    });

    test('should handle texts with stopwords', () => {
      const text1 = 'the machine learning is great';
      const text2 = 'machine learning and deep learning';
      
      const result = calculateJaccard(text1, text2);
      
      // Stopwords should be removed, so only content words are compared
      expect(result.matchedKeywords).not.toContain('the');
      expect(result.matchedKeywords).not.toContain('is');
      expect(result.matchedKeywords).not.toContain('and');
    });

    test('should throw error for invalid text1', () => {
      expect(() => calculateJaccard('', 'valid text')).toThrow('text1 must be a non-empty string');
      expect(() => calculateJaccard(null, 'valid text')).toThrow('text1 must be a non-empty string');
      expect(() => calculateJaccard(123, 'valid text')).toThrow('text1 must be a non-empty string');
    });

    test('should throw error for invalid text2', () => {
      expect(() => calculateJaccard('valid text', '')).toThrow('text2 must be a non-empty string');
      expect(() => calculateJaccard('valid text', null)).toThrow('text2 must be a non-empty string');
      expect(() => calculateJaccard('valid text', undefined)).toThrow('text2 must be a non-empty string');
    });

    test('should handle single word texts', () => {
      const text1 = 'learning';
      const text2 = 'learning';
      
      const result = calculateJaccard(text1, text2);
      
      expect(result.score).toBe(1.000);
      expect(result.matchedKeywords).toEqual(['learn']);
    });
  });

  describe('calculateBatch', () => {
    const sampleTopics = [
      { id: 1, title: 'Machine Learning Algorithms' },
      { id: 2, title: 'Deep Learning and Neural Networks' },
      { id: 3, title: 'Database Management Systems' },
      { id: 4, title: 'Machine Learning Applications' }
    ];

    test('should calculate similarity for multiple topics', () => {
      const queryText = 'machine learning project';
      
      const results = calculateBatch(queryText, sampleTopics);
      
      expect(results).toHaveLength(4);
      expect(results[0]).toHaveProperty('topicId');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('score');
      expect(results[0]).toHaveProperty('matchedKeywords');
    });

    test('should sort results by score in descending order', () => {
      const queryText = 'machine learning algorithms';
      
      const results = calculateBatch(queryText, sampleTopics);
      
      // Check that results are sorted by score (highest first)
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    test('should return highest score for most similar topic', () => {
      const queryText = 'machine learning algorithms';
      
      const results = calculateBatch(queryText, sampleTopics);
      
      // Topic 1 and 4 should have highest scores as they contain "machine learning"
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].title).toMatch(/machine learning/i);
    });

    test('should handle empty topics array', () => {
      const queryText = 'machine learning';
      
      const results = calculateBatch(queryText, []);
      
      expect(results).toEqual([]);
    });

    test('should include matched keywords for each topic', () => {
      const queryText = 'machine learning';
      
      const results = calculateBatch(queryText, sampleTopics);
      
      results.forEach(result => {
        expect(Array.isArray(result.matchedKeywords)).toBe(true);
      });
    });

    test('should preserve topic IDs in results', () => {
      const queryText = 'machine learning';
      
      const results = calculateBatch(queryText, sampleTopics);
      
      const resultIds = results.map(r => r.topicId);
      const originalIds = sampleTopics.map(t => t.id);
      
      expect(resultIds.sort()).toEqual(originalIds.sort());
    });

    test('should handle topics with string IDs', () => {
      const topicsWithStringIds = [
        { id: 'abc-123', title: 'Machine Learning' },
        { id: 'def-456', title: 'Deep Learning' }
      ];
      
      const results = calculateBatch('machine learning', topicsWithStringIds);
      
      expect(results[0].topicId).toBe('abc-123');
      expect(results[1].topicId).toBe('def-456');
    });

    test('should throw error for invalid queryText', () => {
      expect(() => calculateBatch('', sampleTopics)).toThrow('queryText must be a non-empty string');
      expect(() => calculateBatch(null, sampleTopics)).toThrow('queryText must be a non-empty string');
      expect(() => calculateBatch(123, sampleTopics)).toThrow('queryText must be a non-empty string');
    });

    test('should throw error for non-array topics', () => {
      expect(() => calculateBatch('valid text', 'not an array')).toThrow('topics must be an array');
      expect(() => calculateBatch('valid text', null)).toThrow('topics must be an array');
      expect(() => calculateBatch('valid text', {})).toThrow('topics must be an array');
    });

    test('should throw error for invalid topic objects', () => {
      const invalidTopics = [
        { id: 1, title: 'Valid Topic' },
        'invalid topic'
      ];
      
      expect(() => calculateBatch('valid text', invalidTopics)).toThrow('Topic at index 1 must be an object');
    });

    test('should throw error for topics missing id', () => {
      const topicsWithoutId = [
        { title: 'Topic without ID' }
      ];
      
      expect(() => calculateBatch('valid text', topicsWithoutId)).toThrow("must have an 'id' property");
    });

    test('should throw error for topics with invalid title', () => {
      const topicsWithInvalidTitle = [
        { id: 1, title: '' }
      ];
      
      expect(() => calculateBatch('valid text', topicsWithInvalidTitle)).toThrow("must have a non-empty 'title' string property");
    });

    test('should handle large batch of topics', () => {
      const largeTopicSet = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        title: `Topic ${i} about machine learning and AI`
      }));
      
      const results = calculateBatch('machine learning', largeTopicSet);
      
      expect(results).toHaveLength(100);
      expect(results[0].score).toBeGreaterThanOrEqual(results[99].score);
    });

    test('should handle topics with identical titles', () => {
      const topicsWithDuplicates = [
        { id: 1, title: 'Machine Learning' },
        { id: 2, title: 'Machine Learning' },
        { id: 3, title: 'Deep Learning' }
      ];
      
      const results = calculateBatch('machine learning', topicsWithDuplicates);
      
      expect(results).toHaveLength(3);
      // First two should have same score
      expect(results[0].score).toBe(results[1].score);
    });
  });

  describe('Integration Tests', () => {
    test('should work with real-world topic comparison', () => {
      const queryText = 'Building a recommendation system using collaborative filtering';
      const topics = [
        { id: 1, title: 'Recommendation Systems and Collaborative Filtering Techniques' },
        { id: 2, title: 'Deep Learning for Image Recognition' },
        { id: 3, title: 'Building Scalable Web Applications' },
        { id: 4, title: 'Machine Learning Recommendation Algorithms' }
      ];
      
      const results = calculateBatch(queryText, topics);
      
      // Topic 1 should be most similar (contains recommendation, collaborative, filtering)
      expect(results[0].topicId).toBe(1);
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    test('should handle edge case with all stopwords', () => {
      const text1 = 'the and or but';
      const text2 = 'a an the';
      
      const result = calculateJaccard(text1, text2);
      
      // After removing stopwords, both should be empty, resulting in 0 score
      expect(result.score).toBe(0);
      expect(result.matchedKeywords).toEqual([]);
    });
  });
});
