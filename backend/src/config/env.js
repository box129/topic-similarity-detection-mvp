require('dotenv').config();

/**
 * Validate required environment variables
 */
function validateEnv() {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate environment on load
validateEnv();

/**
 * Configuration object with all application settings
 */
const config = {
  // Application environment
  env: process.env.NODE_ENV || 'development',
  
  // Server configuration
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // API version
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL
  },
  
  // SBERT Service configuration
  sbertService: {
    url: process.env.SBERT_SERVICE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.SBERT_TIMEOUT, 10) || 30000, // 30 seconds
    retryAttempts: parseInt(process.env.SBERT_RETRY_ATTEMPTS, 10) || 3
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100 // limit each IP to 100 requests per windowMs
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: process.env.CORS_CREDENTIALS === 'true' || true
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // Similarity thresholds and settings
  similarity: {
    tier2Threshold: parseFloat(process.env.SIMILARITY_TIER2_THRESHOLD) || 0.60,
    tier3TimeWindowHours: parseInt(process.env.SIMILARITY_TIER3_TIME_WINDOW_HOURS, 10) || 48
  }
};

module.exports = config;
