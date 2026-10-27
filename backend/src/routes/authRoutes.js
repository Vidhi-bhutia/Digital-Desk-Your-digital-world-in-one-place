const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  githubAuth,
  githubCallback,
  googleAuth,
  googleCallback,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

// Public auth routes with rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);

// Real OAuth 2.0 Sign-In Routes
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Logout (public or auth)
router.post('/logout', logout);

// Protected auth route
router.get('/me', requireAuth, getMe);

module.exports = router;
