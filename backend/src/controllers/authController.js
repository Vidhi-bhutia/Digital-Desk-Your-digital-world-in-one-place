const validator = require('validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateResetToken, generateOtp, hashToken, seal } = require('../utils/crypto');
const { sendWelcomeEmail, sendOtpEmail } = require('../services/emailService');
const config = require('../config/env');
const logger = require('../utils/logger');

// Helper to set auth cookie
const sendAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  res.cookie('auth_token', token, cookieOptions);
};

/**
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.', code: 'VALIDATION_ERROR' });
    }

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.', code: 'VALIDATION_ERROR' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.', code: 'VALIDATION_ERROR' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.', code: 'EMAIL_IN_USE' });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    sendWelcomeEmail(user).catch(err => logger.error('Async welcome email send error:', err));

    const token = generateToken({ id: user._id });
    sendAuthCookie(res, token);

    logger.info(`User registered & welcome email dispatched: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome email sent!',
      user: user.toAuthUser(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.', code: 'VALIDATION_ERROR' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateToken({ id: user._id });
    sendAuthCookie(res, token);

    logger.info(`User logged in successfully: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toAuthUser(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @route GET /api/auth/me
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toAuthUser(),
  });
};

/**
 * @route POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.', code: 'VALIDATION_ERROR' });
    }

    const safeGenericMessage = 'If an account exists for this email, a 6-digit OTP code has been sent.';

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({ success: true, message: safeGenericMessage });
    }

    const otpCode = generateOtp();
    const { rawToken, hashedToken } = generateResetToken();

    user.passwordResetOtpHash = hashToken(otpCode);
    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendOtpEmail(user, otpCode).catch(err => logger.error('Async OTP email error:', err));

    logger.info(`Password reset OTP requested for: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: safeGenericMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, token, password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.', code: 'VALIDATION_ERROR' });
    }

    let user = null;

    if (otp && email) {
      const normalizedEmail = email.toLowerCase().trim();
      const hashedOtp = hashToken(otp.trim());

      user = await User.findOne({
        email: normalizedEmail,
        passwordResetOtpHash: hashedOtp,
        passwordResetOtpExpires: { $gt: new Date() },
      }).select('+passwordResetOtpHash +passwordResetOtpExpires');
    } else if (token) {
      const hashedToken = hashToken(token);
      user = await User.findOne({
        passwordResetTokenHash: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordResetTokenHash +passwordResetExpires');
    } else {
      return res.status(400).json({ success: false, message: 'OTP code or reset token is required.', code: 'VALIDATION_ERROR' });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 6-digit OTP code.', code: 'INVALID_OTP' });
    }

    user.passwordHash = await User.hashPassword(password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    logger.info(`Password successfully reset for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Your password has been updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/auth/github
 * @desc Initiate GitHub OAuth authorization redirect
 */
const githubAuth = (req, res) => {
  if (!config.github.clientId || !config.github.clientSecret) return res.status(503).send('GitHub OAuth is not configured on the server.');
  const state = require('crypto').randomBytes(24).toString('hex');
  res.cookie('github_connect_state', state, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax', maxAge: 10 * 60 * 1000 });
  const clientId = config.github.clientId;
  const redirectUri = config.github.callbackUrl || `${config.backendUrl}/api/integrations/github/callback`;
  const scope = 'read:user repo';
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  return res.redirect(githubUrl);
};

/**
 * @route GET /api/auth/github/callback
 * @desc Handle GitHub OAuth callback
 */
const githubCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!config.github.clientId || !config.github.clientSecret) return res.redirect(`${config.frontendUrl}/integrations?error=github_not_configured`);
    if (!code) {
      return res.redirect(`${config.frontendUrl}/integrations?error=github_cancelled`);
    }
    if (!state || state !== req.cookies.github_connect_state) return res.redirect(`${config.frontendUrl}/integrations?error=github_state`);
    res.clearCookie('github_connect_state');
    const connectUserId = req.cookies.auth_token && require('../utils/jwt').verifyToken(req.cookies.auth_token)?.id;
    if (!connectUserId) return res.redirect(`${config.frontendUrl}/login?error=github_auth_required`);

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.callbackUrl || `${config.backendUrl}/api/integrations/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      logger.error('GitHub OAuth token exchange failed:', tokenData);
      return res.redirect(`${config.frontendUrl}/login?error=github_token_failed`);
    }

    // Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        'User-Agent': 'Digital-Desk-App',
      },
    });

    const githubProfile = await userResponse.json();

    // Fetch email if not public
    let email = githubProfile.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${accessToken}`,
          'User-Agent': 'Digital-Desk-App',
        },
      });
      const emails = await emailResponse.json();
      if (Array.isArray(emails)) {
        const primary = emails.find(e => e.primary) || emails[0];
        if (primary) email = primary.email;
      }
    }

    const user = await User.findById(connectUserId);
    if (!user) return res.redirect(`${config.frontendUrl}/login?error=github_account`);
    user.githubUsername = githubProfile.login;
    user.githubAccessToken = seal(accessToken);
    await user.save();

    logger.info(`GitHub OAuth connected for Digital Desk user ${user.email} (@${githubProfile.login})`);

    return res.redirect(`${config.frontendUrl}/integrations?connected=github`);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth authorization redirect
 */
const googleAuth = (req, res) => {
  if (!config.google.clientId || !config.google.callbackUrl) return res.status(503).send('Google OAuth is not configured.');
  const clientId = config.google.clientId;
  const redirectUri = config.google.callbackUrl;
  const scope = encodeURIComponent('openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events');
  
  const state = require('crypto').randomBytes(24).toString('hex');
  res.cookie('google_oauth_state', state, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax', maxAge: 10 * 60 * 1000 });
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  return res.redirect(googleUrl);
};

/**
 * @route GET /api/auth/google/callback
 * @desc Handle Google OAuth callback
 */
const googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.redirect(`${config.frontendUrl}/login?error=google_cancelled`);
    }
    if (!state || state !== req.cookies.google_oauth_state) return res.redirect(`${config.frontendUrl}/login?error=google_state`);
    res.clearCookie('google_oauth_state');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    if (!accessToken) {
      logger.error('Google OAuth token exchange failed:', tokenData);
      return res.redirect(`${config.frontendUrl}/login?error=google_token_failed`);
    }

    // Fetch Google profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleProfile = await userResponse.json();
    const targetEmail = googleProfile.email.toLowerCase();

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = await User.create({
        name: googleProfile.name,
        email: targetEmail,
        passwordHash: await User.hashPassword(generateOtp() + 'GoogleAuth!'),
        avatar: googleProfile.picture,
        googleEmail: targetEmail,
        googleAccessToken: seal(accessToken),
        googleRefreshToken: refreshToken ? seal(refreshToken) : '',
      });
      sendWelcomeEmail(user).catch(() => {});
    } else {
      user.googleEmail = targetEmail;
      user.googleAccessToken = seal(accessToken);
      if (refreshToken) user.googleRefreshToken = seal(refreshToken);
      if (googleProfile.picture) user.avatar = googleProfile.picture;
      await user.save();
    }

    const token = generateToken({ id: user._id });
    sendAuthCookie(res, token);

    logger.info(`Google OAuth login successful for: ${user.email}`);

    return res.redirect(`${config.frontendUrl}/dashboard?connected=google`);
  } catch (error) {
    next(error);
  }
};

const googleConnectStart = (req, res) => {
  if (!config.google.clientId || !config.google.clientSecret) return res.status(503).json({ success: false, message: 'Google OAuth is not configured.' });
  const state = require('crypto').randomBytes(24).toString('hex');
  res.cookie('google_connect_state', state, { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax', maxAge: 10 * 60 * 1000 });
  const scope = encodeURIComponent('openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events');
  const callbackUrl = config.google.callbackUrl || `${config.backendUrl}/api/integrations/google/callback`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.google.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}&include_granted_scopes=true`;
  res.redirect(url);
};

const googleConnectCallback = async (req, res, next) => {
  try {
    if (!req.query.code || req.query.state !== req.cookies.google_connect_state) return res.redirect(`${config.frontendUrl}/integrations?error=google_state`);
    res.clearCookie('google_connect_state');
    const callbackUrl = config.google.callbackUrl || `${config.backendUrl}/api/integrations/google/callback`;
    const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: req.query.code, client_id: config.google.clientId, client_secret: config.google.clientSecret, redirect_uri: callbackUrl, grant_type: 'authorization_code' }) });
    const tokens = await response.json();
    if (!response.ok || !tokens.access_token) return res.redirect(`${config.frontendUrl}/integrations?error=google_token`);
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = await profileResponse.json();
    const userId = req.cookies.auth_token && require('../utils/jwt').verifyToken(req.cookies.auth_token)?.id;
    let user = userId ? await User.findById(userId) : null;
    if (!user && profile.email) user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) return res.redirect(`${config.frontendUrl}/login?error=google_account`);
    user.googleEmail = profile.email || '';
    user.googleAccessToken = seal(tokens.access_token);
    if (tokens.refresh_token) user.googleRefreshToken = seal(tokens.refresh_token);
    await user.save();
    res.redirect(`${config.frontendUrl}/integrations?connected=google`);
  } catch (error) { next(error); }
};

module.exports = {
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
  googleConnectStart,
  googleConnectCallback,
};
