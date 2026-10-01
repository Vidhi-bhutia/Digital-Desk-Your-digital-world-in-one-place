const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

// Public auth routes with rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);

// Logout (public or auth)
router.post('/logout', logout);

// Protected auth route
router.get('/me', requireAuth, getMe);

module.exports = router;
