const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  listSessions,
  logoutOtherSessions,
  deleteAccount,
  requestAccountDeletionOtp,
  requestEmailVerification,
  verifyEmail,
  requestPhoneVerification,
  verifyPhone,
  forgotPassword,
  resetPassword,
  githubAuth,
  githubCallback,
  googleAuth,
  googleCallback,
  googleConnectStart,
  googleConnectCallback,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

// Public auth routes with rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);
router.post('/email-verification/request', authRateLimiter, requestEmailVerification);
router.post('/email-verification/verify', authRateLimiter, verifyEmail);

// Real OAuth 2.0 Sign-In Routes
router.get('/github', requireAuth, githubAuth);
router.get('/github/callback', githubCallback);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/connect', googleConnectStart);
router.get('/google/connect/callback', googleConnectCallback);

// Logout (public or auth)
router.post('/logout', logout);

// Protected auth route
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.put('/password', requireAuth, changePassword);
router.get('/sessions', requireAuth, listSessions);
router.delete('/sessions/others', requireAuth, logoutOtherSessions);
router.delete('/account', requireAuth, deleteAccount);
router.post('/account/delete-otp', requireAuth, authRateLimiter, requestAccountDeletionOtp);
router.post('/phone/verification/request', requireAuth, authRateLimiter, requestPhoneVerification);
router.post('/phone/verification/verify', requireAuth, authRateLimiter, verifyPhone);

module.exports = router;
