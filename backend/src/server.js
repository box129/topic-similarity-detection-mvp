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
  max: config.rateLimit.max
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

// API Routes
app.post('/api/similarity/check', (req, res, next) => {
  if (!similarityController) {
    similarityController = require('./controllers/similarity.controller');
  }
  similarityController.checkSimilarity(req, res, next);
});

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
