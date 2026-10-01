const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    } 
    // 2. Fallback to Authorization header if present
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
        code: 'UNAUTHENTICATED',
      });
    }

    // Validate token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
        code: 'INVALID_TOKEN',
      });
    }

    // Retrieve authenticated user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_ERROR',
    });
  }
};

module.exports = {
  requireAuth,
};
