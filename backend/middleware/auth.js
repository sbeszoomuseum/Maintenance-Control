/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and extracts super admin info
 */

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please log in.',
      code: 'NO_TOKEN',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
        code: 'INVALID_TOKEN',
      });
    }

    // Attach user info to request
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
