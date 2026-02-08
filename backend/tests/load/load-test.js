/**
 * Load Testing Script for API Endpoints
 * Tests concurrent requests and system performance under load
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';
const CONCURRENT_REQUESTS = 10;
const TOTAL_REQUESTS = 100;

// Test data
const testTopics = [
  'Machine Learning Applications in Healthcare Diagnosis Using Neural Networks',
  'Blockchain Technology for Supply Chain Management and Transparency',
  'Natural Language Processing with Transformer Models and BERT',
  'Computer Vision Systems for Autonomous Vehicle Navigation',
  'Cybersecurity Threats in Internet of Things Connected Devices',
  'Cloud Computing Architecture Patterns for Scalable Applications',
  'Quantum Computing Algorithms for Cryptography and Security',
  'Deep Learning Techniques for Image Recognition and Classification',
  'Federated Learning Approaches for Privacy Preserving Machine Learning',
  'Smart Contract Development and Security Analysis on Blockchain'
];

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null
};

/**
 * Make a single API request
 */
async function makeRequest(topic) {
  const startTime = Date.now();
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/similarity/check`,
      { topic },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5 second timeout
      }
    );
    
    const responseTime = Date.now() - startTime;
    
    metrics.successfulRequests++;
    metrics.responseTimes.push(responseTime);
    
    return {
      success: true,
      responseTime,
      statusCode: response.status
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    metrics.failedRequests++;
    metrics.errors.push({
      message: error.message,
      responseTime
    });
    
    return {
      success: false,
      responseTime,
      error: error.message
    };
  }
}

/**
 * Run concurrent requests
 */
async function runConcurrentRequests(count) {
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    const topic = testTopics[i % testTopics.length];
    promises.push(makeRequest(topic));
  }
  
  return Promise.all(promises);
}

/**
 * Calculate statistics
 */
function calculateStats() {
  const responseTimes = metrics.responseTimes;
  
  if (responseTimes.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      p95: 0,
      p99: 0
    };
  }
  
  const sorted = [...responseTimes].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

/**
 * Main load test function
 */
async function runLoadTest() {
  console.log('🚀 Starting Load Test...\n');
  console.log(`Configuration:`);
  console.log(`  - API Base URL: ${API_BASE_URL}`);
  console.log(`  - Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`  - Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`  - Test Topics: ${testTopics.length}`);
  console.log('');
  
  // Check if server is running
  try {
    await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
    console.log('✓ Server is running\n');
  } catch (error) {
    console.error('✗ Server is not running. Please start the server first.');
    process.exit(1);
  }
  
  metrics.startTime = Date.now();
  
  // Run load test in batches
  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS);
  
  for (let batch = 0; batch < batches; batch++) {
    const requestsInBatch = Math.min(
      CONCURRENT_REQUESTS,
      TOTAL_REQUESTS - (batch * CONCURRENT_REQUESTS)
    );
    
    process.stdout.write(`\rBatch ${batch + 1}/${batches} - Requests: ${metrics.totalRequests}/${TOTAL_REQUESTS}`);
    
    await runConcurrentRequests(requestsInBatch);
    metrics.totalRequests += requestsInBatch;
  }
  
  metrics.endTime = Date.now();
  
  console.log('\n\n📊 Load Test Results:\n');
  
  // Overall metrics
  const totalTime = (metrics.endTime - metrics.startTime) / 1000;
  const requestsPerSecond = Math.round(metrics.totalRequests / totalTime);
  
  console.log('Overall Performance:');
  console.log(`  Total Requests: ${metrics.totalRequests}`);
  console.log(`  Successful: ${metrics.successfulRequests} (${Math.round(metrics.successfulRequests / metrics.totalRequests * 100)}%)`);
  console.log(`  Failed: ${metrics.failedRequests} (${Math.round(metrics.failedRequests / metrics.totalRequests * 100)}%)`);
  console.log(`  Total Time: ${totalTime.toFixed(2)}s`);
  console.log(`  Requests/Second: ${requestsPerSecond}`);
  console.log('');
  
  // Response time statistics
  const stats = calculateStats();
  console.log('Response Time Statistics (ms):');
  console.log(`  Min: ${stats.min}ms`);
  console.log(`  Max: ${stats.max}ms`);
  console.log(`  Average: ${stats.avg}ms`);
  console.log(`  Median: ${stats.median}ms`);
  console.log(`  95th Percentile: ${stats.p95}ms`);
  console.log(`  99th Percentile: ${stats.p99}ms`);
  console.log('');
  
  // Performance assessment
  console.log('Performance Assessment:');
  if (stats.avg < 500) {
    console.log('  ✓ Excellent - Average response time < 500ms');
  } else if (stats.avg < 1000) {
    console.log('  ✓ Good - Average response time < 1000ms');
  } else if (stats.avg < 2000) {
    console.log('  ⚠ Fair - Average response time < 2000ms');
  } else {
    console.log('  ✗ Poor - Average response time > 2000ms');
  }
  
  if (stats.p95 < 1000) {
    console.log('  ✓ 95% of requests completed in < 1000ms');
  } else {
    console.log('  ⚠ 95% of requests completed in > 1000ms');
  }
  
  if (metrics.failedRequests === 0) {
    console.log('  ✓ No failed requests');
  } else {
    console.log(`  ⚠ ${metrics.failedRequests} failed requests`);
  }
  console.log('');
  
  // Error details
  if (metrics.errors.length > 0) {
    console.log('Error Details:');
    const errorCounts = {};
    metrics.errors.forEach(error => {
      errorCounts[error.message] = (errorCounts[error.message] || 0) + 1;
    });
    
    Object.entries(errorCounts).forEach(([message, count]) => {
      console.log(`  - ${message}: ${count} occurrences`);
    });
    console.log('');
  }
  
  // Recommendations
  console.log('Recommendations:');
  if (stats.avg > 1000) {
    console.log('  - Consider optimizing database queries');
    console.log('  - Add caching for frequently accessed data');
    console.log('  - Review algorithm performance');
  }
  if (metrics.failedRequests > 0) {
    console.log('  - Investigate error causes');
    console.log('  - Add retry logic for transient failures');
    console.log('  - Increase timeout values if needed');
  }
  if (requestsPerSecond < 10) {
    console.log('  - Consider horizontal scaling');
    console.log('  - Optimize concurrent request handling');
  }
  
  console.log('\n✅ Load test completed!\n');
}

// Run the load test
if (require.main === module) {
  runLoadTest().catch(error => {
    console.error('\n❌ Load test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runLoadTest };
