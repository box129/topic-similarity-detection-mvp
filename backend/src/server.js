const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const logger = require('./config/logger');
const similarityController = require('./controllers/similarity.controller');
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
app.post('/api/similarity/check', similarityController.checkSimilarity);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Only start server if not in test mode
if (config.env !== 'test') {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
    console.log(`API Version: ${config.apiVersion}`);
  });
}

module.exports = app;
