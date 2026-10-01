const config = require('../config/env');
const logger = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found - ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
};

const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err);

  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode === 200) statusCode = 500;

  let message = err.message || 'An unexpected server error occurred.';
  let code = err.code || 'INTERNAL_SERVER_ERROR';

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists.`;
    code = 'DUPLICATE_KEY_ERROR';
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    code = 'VALIDATION_ERROR';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token signature.';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
    code = 'TOKEN_EXPIRED';
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
