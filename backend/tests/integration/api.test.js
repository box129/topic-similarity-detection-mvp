/**
 * Integration Tests for Main API Endpoint
 * 
 * Tests the POST /api/similarity/check endpoint with:
 * - Happy path scenarios
 * - Input validation
 * - Error handling
 * - Performance requirements
 */

const request = require('supertest');
const app = require('../../src/server');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

// Mock axios for SBERT service
jest.mock('axios');

// Mock logger to avoid console output
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

describe('POST /api/similarity/check - Integration Tests', () => {
  // Test data
  const mockEmbedding = new Array(384).fill(0.5);
  let testTopicIds = [];

  const getSimilarityData = (body) => body.data || {
    input_topic: body.topic,
    overall_risk: body.overallRisk,
    max_similarity: body.overallMaxSimilarity,
    tier1_historical: body.results?.tier1_historical || [],
    tier2_current: body.results?.tier2_current_session || [],
    tier3_under_review: body.results?.tier3_under_review || []
  };

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';

    // Mock SBERT service responses
    axios.post.mockResolvedValue({
      data: { embedding: mockEmbedding }
    });

    axios.get.mockResolvedValue({
      status: 200,
      data: { status: 'healthy' }
    });

    // Seed test data - create 3 historical topics
    try {
      const topic1 = await prisma.historical_topics.create({
        data: {
          title: 'Machine Learning Applications in Healthcare Diagnosis',
          keywords: 'neural networks, deep learning, medical imaging',
          session_year: '2023',
          supervisor_name: 'Dr. Smith',
          category: 'Computer Science',
          embedding: JSON.stringify(mockEmbedding)
        }
      });

      const topic2 = await prisma.historical_topics.create({
        data: {
          title: 'Natural Language Processing for Sentiment Analysis',
          keywords: 'NLP, transformers, BERT, sentiment',
          session_year: '2023',
          supervisor_name: 'Dr. Johnson',
          category: 'Computer Science',
          embedding: JSON.stringify(mockEmbedding)
        }
      });

      const topic3 = await prisma.historical_topics.create({
        data: {
          title: 'Blockchain Technology in Supply Chain Management',
          keywords: 'distributed ledger, smart contracts, logistics',
          session_year: '2022',
          supervisor_name: 'Dr. Williams',
          category: 'Information Systems',
          embedding: JSON.stringify(mockEmbedding)
        }
      });

      testTopicIds = [topic1.id, topic2.id, topic3.id];
    } catch (error) {
      console.log('Test data seeding skipped (database not available):', error.message);
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      if (testTopicIds.length > 0) {
        await prisma.historical_topics.deleteMany({
          where: {
            id: { in: testTopicIds }
          }
        });
      }
    } catch (error) {
      console.log('Test data cleanup skipped:', error.message);
    }

    await prisma.$disconnect();
  });

  describe('Happy Path Tests', () => {
    test('should return 200 for valid topic with 7-24 words', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Machine Learning Applications in Healthcare Diagnosis Using Neural Networks'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test('should return correct response structure', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Deep Learning for Medical Image Analysis and Diagnosis',
          keywords: 'CNN, ResNet, medical imaging'
        })
        .expect(200);

      // Check top-level structure
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');

      // Check results structure
      expect(response.body.data).toHaveProperty('tier1_historical');
      expect(response.body.data).toHaveProperty('tier2_current');
      expect(response.body.data).toHaveProperty('tier3_under_review');

      // Check tier1_historical is array of max 5
      expect(Array.isArray(response.body.data.tier1_historical)).toBe(true);
      expect(response.body.data.tier1_historical.length).toBeLessThanOrEqual(5);

      // Check tier2 and tier3 are arrays
      expect(Array.isArray(response.body.data.tier2_current)).toBe(true);
      expect(Array.isArray(response.body.data.tier3_under_review)).toBe(true);

      // Check overall risk is valid
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(response.body.data.overall_risk);
    });

    test('should handle topic with keywords', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Artificial Intelligence in Autonomous Vehicle Navigation Systems',
          keywords: 'computer vision, sensor fusion, path planning'
        })
        .expect(200);

      expect(getSimilarityData(response.body).input_topic).toBe('Artificial Intelligence in Autonomous Vehicle Navigation Systems');
    });

    test('should handle topic without keywords', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Cloud Computing Infrastructure for Big Data Analytics'
        })
        .expect(200);

      expect(getSimilarityData(response.body).input_topic).toBe('Cloud Computing Infrastructure for Big Data Analytics');
    });
  });

  describe('Validation Tests', () => {
    test('should accept topic with less than 7 words (no word count validation)', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Machine Learning Applications'
        })
        .expect(200);

      expect(response.body.data || response.body.results).toBeDefined();
    });

    test('should accept topic with more than 24 words (no word count validation)', async () => {
      const longTopic = 'This is a very long topic title that exceeds the maximum allowed word count of twenty four words and should therefore be accepted by the API endpoint';
      
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: longTopic
        })
        .expect(200);

      expect(response.body.data || response.body.results).toBeDefined();
    });

    test('should return 400 for missing topic field', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          keywords: 'some keywords'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message.toLowerCase()).toContain('topic');
      expect(response.body).toHaveProperty('details');
    });

    test('should return 400 for empty topic', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('details');
    });

    test('should return 400 for topic with only whitespace', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: '   '
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('details');
    });

    test('should return 400 for null topic', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: null
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database errors gracefully', async () => {
      // Use jest.spyOn for proper mocking and restoration
      const queryRawSpy = jest.spyOn(prisma, '$queryRaw')
        .mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Machine Learning Applications in Healthcare Diagnosis'
        });

      // Restore original function
      queryRawSpy.mockRestore();

      // Should handle error gracefully (may return 200 with empty results or 500)
      expect([200, 500, 503]).toContain(response.status);
      // If 200, should have results property (graceful degradation)
      // If 500/503, should have error property
      if (response.status === 200) {
        expect(response.body.data || response.body.results).toBeDefined();
      } else {
        expect(response.body).toHaveProperty('error');
      }
    });

    test('should return 200 with graceful degradation when SBERT service is down', async () => {
      // Mock SBERT service failure
      axios.post.mockRejectedValueOnce({ code: 'ECONNREFUSED' });

      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Natural Language Processing for Text Classification Tasks'
        })
        .expect(200);

      // Should still return results using Jaccard and TF-IDF
      expect(response.body.data || response.body.results).toBeDefined();
      
      // Check algorithm status if present
      if (response.body.algorithmStatus) {
        expect(response.body.algorithmStatus.sbert).toBe(false);
        expect(response.body.algorithmStatus.jaccard).toBe(true);
        expect(response.body.algorithmStatus.tfidf).toBe(true);
      }
    });

    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .set('Content-Type', 'application/json')
        .send('{"topic": invalid json}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle unexpected errors gracefully', async () => {
      // Use jest.spyOn for proper mocking and restoration
      const queryRawSpy = jest.spyOn(prisma, '$queryRaw')
        .mockRejectedValueOnce(new Error('Unexpected database error'));

      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Quantum Computing Applications in Cryptography Systems'
        });

      // Restore original function
      queryRawSpy.mockRestore();

      // Should handle error gracefully (may return 200 with empty results or 500)
      expect([200, 500, 503]).toContain(response.status);
      // If 200, should have results property (graceful degradation)
      // If 500/503, should have error property
      if (response.status === 200) {
        expect(response.body.data || response.body.results).toBeDefined();
      } else {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Performance Tests', () => {
    test('should respond within 1000ms for valid request', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Internet of Things Security and Privacy Challenges'
        })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000);
    });

    test('should include FYP success response envelope', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Augmented Reality Applications in Education and Training'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle topic with exactly 7 words', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Machine Learning Applications in Healthcare Diagnosis Systems'
        })
        .expect(200);

      expect(response.body.data || response.body.results).toBeDefined();
    });

    test('should handle topic with exactly 24 words', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Deep Learning Neural Networks for Medical Image Analysis and Diagnosis Using Convolutional Architectures and Transfer Learning Techniques in Healthcare Applications and Clinical Decision Support Systems'
        })
        .expect(200);

      expect(response.body.data || response.body.results).toBeDefined();
    });

    test('should handle topic with special characters', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'AI/ML & Deep-Learning (2024) - Research Applications'
        })
        .expect(200);

      expect(response.body.data || response.body.results).toBeDefined();
    });

    test('should handle topic with numbers', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Machine Learning 2024 with Python 3.9 and TensorFlow 2.0'
        })
        .expect(200);

      expect(response.body.data || response.body.results).toBeDefined();
    });

    test('should handle very long keywords', async () => {
      const longKeywords = 'keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8, keyword9, keyword10';
      
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Distributed Systems Architecture for Cloud Computing Platforms',
          keywords: longKeywords
        })
        .expect(200);

      expect(getSimilarityData(response.body).input_topic).toBe('Distributed Systems Architecture for Cloud Computing Platforms');
    });
  });

  describe('Response Data Validation', () => {
    test('should return valid similarity scores (0-100 range)', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Cybersecurity Threats and Defense Mechanisms in Modern Networks'
        })
        .expect(200);

      const tier1 = getSimilarityData(response.body).tier1_historical;
      
      tier1.forEach(result => {
        expect(result).not.toHaveProperty('combined');
        
        if (result.jaccard !== undefined) {
          expect(result.jaccard).toBeGreaterThanOrEqual(0);
          expect(result.jaccard).toBeLessThanOrEqual(100);
        }
        
        if (result.tfidf !== undefined) {
          expect(result.tfidf).toBeGreaterThanOrEqual(0);
          expect(result.tfidf).toBeLessThanOrEqual(100);
        }
        
        if (result.sbert !== undefined) {
          expect(result.sbert).toBeGreaterThanOrEqual(0);
          expect(result.sbert).toBeLessThanOrEqual(100);
        }
      });
    });

    test('should not expose combined score in normal success topic results', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Robotics and Automation in Manufacturing Industry Applications'
        })
        .expect(200);

      const tier1 = getSimilarityData(response.body).tier1_historical;
      
      tier1.forEach(result => {
        expect(result).not.toHaveProperty('combined');
        expect(result).not.toHaveProperty('scores');
      });
    });

    test('should include all required fields in topic results', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .send({
          topic: 'Software Engineering Best Practices for Agile Development'
        })
        .expect(200);

      const tier1 = getSimilarityData(response.body).tier1_historical;
      
      if (tier1.length > 0) {
        const firstResult = tier1[0];
        
        expect(firstResult).toHaveProperty('id');
        expect(firstResult).toHaveProperty('title');
        expect(firstResult).toHaveProperty('year');
        expect(firstResult).toHaveProperty('supervisor');
        expect(firstResult).toHaveProperty('category');
      }
    });
  });

  describe('Content-Type Handling', () => {
    test('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .set('Content-Type', 'application/json')
        .send({
          topic: 'Data Mining Techniques for Business Intelligence Applications'
        })
        .expect(200);

      expect(response.body.data || response.body.results).toBeDefined();
    });

    test('should reject non-JSON content type', async () => {
      const response = await request(app)
        .post('/api/similarity/check')
        .set('Content-Type', 'text/plain')
        .send('topic=test')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('details');
    });
  });
});

describe('Health Check Endpoint', () => {
  test('should return 200 for health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message');
  });
});

describe('404 Handler', () => {
  test('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/non-existent-route')
      .expect(404);

    // New error handler format
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(response.body.error).toHaveProperty('message');
  });

  test('should return 404 for wrong HTTP method', async () => {
    const response = await request(app)
      .get('/api/similarity/check')
      .expect(404);

    // New error handler format
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });
});
