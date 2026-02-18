/**
 * Error Handling Middleware
 * Catches and formats errors consistently
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(',');
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
      code: 'VALIDATION_ERROR',
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: 'DUPLICATE_KEY',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
  });
};

module.exports = errorHandler;
