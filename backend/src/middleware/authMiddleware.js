const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');
const AuthSession = require('../models/AuthSession');
const config = require('../config/env');

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
    if (decoded.jti && !await AuthSession.exists({ userId: decoded.id, tokenId: decoded.jti, expiresAt: { $gt: new Date() } })) return res.status(401).json({ success: false, message: 'This session has ended. Please log in again.', code: 'SESSION_REVOKED' });

    // Retrieve authenticated user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }
    const authMaintenancePaths = ['/me', '/email-verification/request', '/email-verification/verify', '/profile', '/password', '/sessions', '/sessions/others', '/account', '/account/delete-otp'];
    const isEmailVerificationRoute = req.baseUrl.endsWith('/auth') && authMaintenancePaths.includes(req.path);
    if (!user.emailVerifiedAt && !isEmailVerificationRoute) return res.status(403).json({ success: false, message: 'Verify your email before continuing.', code: 'EMAIL_UNVERIFIED', email: user.email });

    // Upgrade older non-session JWTs in place so existing signed-in users are
    // visible in the session list and can revoke sessions immediately.
    if (!decoded.jti) {
      const tokenId = `legacy-${require('crypto').createHash('sha256').update(token).digest('hex')}`;
      req.authSessionId = tokenId;
      const expiresAt = new Date((decoded.exp || Math.floor(Date.now() / 1000) + 604800) * 1000);
      try { await AuthSession.updateOne({ userId: user._id, tokenId }, { $setOnInsert: { userId: user._id, tokenId, expiresAt, device: req.get('user-agent') || 'Unknown device', ip: req.ip || '' } }, { upsert: true }); } catch (e) { if (e.code !== 11000) throw e; }
      const replacement = require('../utils/jwt').generateToken({ id: user._id, jti: tokenId });
      res.cookie('auth_token', replacement, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: config.nodeEnv === 'production' ? 'none' : 'lax', maxAge: Math.max(0, expiresAt.getTime() - Date.now()) });
    } else {
      req.authSessionId = decoded.jti;
      await AuthSession.updateOne({ userId: user._id, tokenId: decoded.jti, lastSeenAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } }, { $set: { lastSeenAt: new Date() } });
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
