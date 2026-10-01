const validator = require('validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateResetToken, hashToken } = require('../utils/crypto');
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
 * @desc Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
        code: 'VALIDATION_ERROR',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        code: 'EMAIL_IN_USE',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // Generate token & set cookie
    const token = generateToken({ id: user._id });
    sendAuthCookie(res, token);

    logger.info(`User registered successfully: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: user.toAuthUser(),
      token, // Also return token in response body for flexible client integration
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email (include passwordHash)
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate token & set cookie
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
 * @desc Logout user / clear cookie
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
 * @desc Get currently authenticated user
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toAuthUser(),
  });
};

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset token (generic response)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
        code: 'VALIDATION_ERROR',
      });
    }

    const safeGenericMessage = 'If an account exists for this email, reset instructions have been sent.';

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always return safe generic response regardless of whether email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: safeGenericMessage,
      });
    }

    // Generate reset token
    const { rawToken, hashedToken } = generateResetToken();
    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    logger.info(`Password reset requested for: ${user.email}`);

    // In development mode, include rawToken in response for convenience in testing
    const responsePayload = {
      success: true,
      message: safeGenericMessage,
    };

    if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
      responsePayload.debugResetToken = rawToken;
      responsePayload.debugResetUrl = `${config.frontendUrl}/reset-password/${rawToken}`;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required.',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
        code: 'VALIDATION_ERROR',
      });
    }

    // Hash token to compare with DB
    const hashedToken = hashToken(token);

    // Find user with valid matching token & not expired
    const user = await User.findOne({
      passwordResetTokenHash: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
        code: 'INVALID_TOKEN',
      });
    }

    // Set new password
    user.passwordHash = await User.hashPassword(password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
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

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
