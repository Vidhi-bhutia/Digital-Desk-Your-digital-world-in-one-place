const validator = require('validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateResetToken, generateOtp, hashToken } = require('../utils/crypto');
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
  const clientId = config.github.clientId;
  const redirectUri = config.github.callbackUrl;
  const scope = 'user,repo,read:user';
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  return res.redirect(githubUrl);
};

/**
 * @route GET /api/auth/github/callback
 * @desc Handle GitHub OAuth callback
 */
const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${config.frontendUrl}/login?error=github_cancelled`);
    }

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
        redirect_uri: config.github.callbackUrl,
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

    const targetEmail = (email || `${githubProfile.login}@github.digitaldesk.app`).toLowerCase();

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = await User.create({
        name: githubProfile.name || githubProfile.login,
        email: targetEmail,
        passwordHash: await User.hashPassword(generateOtp() + 'GithubAuth!'),
        avatar: githubProfile.avatar_url,
        githubUsername: githubProfile.login,
        githubAccessToken: accessToken,
      });
      sendWelcomeEmail(user).catch(() => {});
    } else {
      user.githubUsername = githubProfile.login;
      user.githubAccessToken = accessToken;
      if (githubProfile.avatar_url) user.avatar = githubProfile.avatar_url;
      await user.save();
    }

    const token = generateToken({ id: user._id });
    sendAuthCookie(res, token);

    logger.info(`GitHub OAuth login successful for: ${user.email} (@${githubProfile.login})`);

    return res.redirect(`${config.frontendUrl}/dashboard?connected=github`);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth authorization redirect
 */
const googleAuth = (req, res) => {
  const clientId = config.google.clientId;
  const redirectUri = config.google.callbackUrl;
  const scope = encodeURIComponent('openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly');
  
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  return res.redirect(googleUrl);
};

/**
 * @route GET /api/auth/google/callback
 * @desc Handle Google OAuth callback
 */
const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${config.frontendUrl}/login?error=google_cancelled`);
    }

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
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken || '',
      });
      sendWelcomeEmail(user).catch(() => {});
    } else {
      user.googleEmail = targetEmail;
      user.googleAccessToken = accessToken;
      if (refreshToken) user.googleRefreshToken = refreshToken;
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
};
