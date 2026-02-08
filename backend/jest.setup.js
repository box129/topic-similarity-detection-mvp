// Jest setup file for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use different port for testing

// Increase timeout for database operations
jest.setTimeout(10000);

// Global test utilities can be added here
global.testUtils = {
  // Helper to generate random test data
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  // Helper to create test topic data
  createTestTopicData: (overrides = {}) => {
    return {
      title: 'Test Topic Title',
      keywords: 'test, keywords, sample',
      sessionYear: '2024/2025',
      supervisorName: 'Dr. Test Supervisor',
      category: 'Test Category',
      ...overrides
    };
  }
};

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
