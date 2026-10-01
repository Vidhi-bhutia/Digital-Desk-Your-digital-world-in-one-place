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
 * @desc Register a new user & send personalized Welcome Email
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

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

    // Send Personalized Welcome Email
    sendWelcomeEmail(user).catch(err => logger.error('Async welcome email send error:', err));

    // Generate token & set cookie
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

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
      });
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
 * @desc Send 6-digit OTP verification email to user
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

    const safeGenericMessage = 'If an account exists for this email, a 6-digit OTP code has been sent.';

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: safeGenericMessage,
      });
    }

    // Generate 6-digit OTP & Reset Token
    const otpCode = generateOtp();
    const { rawToken, hashedToken } = generateResetToken();

    user.passwordResetOtpHash = hashToken(otpCode);
    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP email
    sendOtpEmail(user, otpCode).catch(err => logger.error('Async OTP email error:', err));

    logger.info(`Password reset OTP requested for: ${user.email}`);

    const responsePayload = {
      success: true,
      message: safeGenericMessage,
    };

    // In development mode, return debug OTP for testing convenience
    if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
      responsePayload.debugOtp = otpCode;
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
 * @desc Reset password using 6-digit OTP code or reset token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, token, password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
        code: 'VALIDATION_ERROR',
      });
    }

    let user = null;

    // Case 1: Verification using 6-Digit OTP code
    if (otp && email) {
      const normalizedEmail = email.toLowerCase().trim();
      const hashedOtp = hashToken(otp.trim());

      user = await User.findOne({
        email: normalizedEmail,
        passwordResetOtpHash: hashedOtp,
        passwordResetOtpExpires: { $gt: new Date() },
      }).select('+passwordResetOtpHash +passwordResetOtpExpires');
    }
    // Case 2: Verification using token URL parameter
    else if (token) {
      const hashedToken = hashToken(token);
      user = await User.findOne({
        passwordResetTokenHash: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordResetTokenHash +passwordResetExpires');
    } else {
      return res.status(400).json({
        success: false,
        message: 'OTP code or reset token is required.',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired 6-digit OTP code / reset token.',
        code: 'INVALID_OTP',
      });
    }

    // Update password
    user.passwordHash = await User.hashPassword(password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    logger.info(`Password successfully reset for user via OTP/Token: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Your password has been updated successfully. You can now log in with your new password.',
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
