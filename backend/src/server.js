const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const logger = require('./config/logger');
// Lazy-load the similarity controller to avoid Prisma initialization blocking
let similarityController;
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  handler: (req, res) => {
    res.set('Retry-After', '300');
    res.status(429).json({
      status: 'error',
      message: 'Rate limit exceeded. Please try again in 5 minutes.',
      details: {
        retry_after: 300,
        limit: '100 requests per hour'
      }
    });
  }
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: config.env,
    apiVersion: config.apiVersion
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: config.env,
    apiVersion: config.apiVersion
  });
});

// API Routes
const similarityRouteHandler = (req, res, next) => {
  if (!similarityController) {
    similarityController = require('./controllers/similarity.controller');
  }
  similarityController.checkSimilarity(req, res, next);
};

app.post('/api/similarity/check', similarityRouteHandler);

// Architecture alias — matches API spec
app.post('/api/v1/check-similarity', similarityRouteHandler);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Only start server if not in test mode
if (config.env !== 'test') {
  const server = app.listen(config.port, '0.0.0.0');
  
  server.on('listening', () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
    console.log(`API Version: ${config.apiVersion}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}

module.exports = app;
