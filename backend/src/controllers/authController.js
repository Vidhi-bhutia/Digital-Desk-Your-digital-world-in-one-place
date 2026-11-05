const validator = require('validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateResetToken, generateOtp, hashToken, seal } = require('../utils/crypto');
const { sendWelcomeEmail, sendOtpEmail, sendEmailVerificationOtp, sendAccountDeletionOtp } = require('../services/emailService');
const config = require('../config/env');
const logger = require('../utils/logger');
const AuthSession = require('../models/AuthSession');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const CalendarEvent = require('../models/CalendarEvent');
const { notifyIfAllowed } = require('./notificationController');
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const isOtpCoolingDown = sentAt => sentAt && Date.now() - new Date(sentAt).getTime() < OTP_RESEND_COOLDOWN_MS;

const otpHashMatches = (storedHash, candidateHash) => {
  if (!/^[a-f0-9]{64}$/i.test(storedHash || '') || !/^[a-f0-9]{64}$/i.test(candidateHash || '')) return false;
  return require('crypto').timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
};

const consumeOtp = async (user, code, { hashField, expiresField, attemptsField, extraSet = {} }) => {
  if (!user || !user[hashField] || !user[expiresField] || user[expiresField] <= new Date() || (user[attemptsField] || 0) >= 5) return false;
  const candidateHash = hashToken(String(code));
  if (!otpHashMatches(user[hashField], candidateHash)) {
    await User.updateOne({ _id: user._id, [hashField]: user[hashField], [expiresField]: { $gt: new Date() }, $or: [{ [attemptsField]: { $lt: 5 } }, { [attemptsField]: { $exists: false } }] }, { $inc: { [attemptsField]: 1 } });
    return false;
  }
  const set = { [hashField]: null, [expiresField]: null, [attemptsField]: 0, ...extraSet };
  const result = await User.updateOne({ _id: user._id, [hashField]: user[hashField], [expiresField]: { $gt: new Date() }, $or: [{ [attemptsField]: { $lt: 5 } }, { [attemptsField]: { $exists: false } }] }, { $set: set });
  if (result.modifiedCount !== 1) return false;
  Object.assign(user, set);
  return true;
};

const issueSession = async (user, req) => {
  const tokenId = require('crypto').randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  const token = generateToken({ id: user._id, jti: tokenId });
  await AuthSession.create({ userId: user._id, tokenId, expiresAt, ip: req.ip || '', device: req.get('user-agent') || 'Unknown device' });
  return token;
};

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
    const emailCode = generateOtp(); user.emailVerificationOtpHash = hashToken(emailCode); user.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); user.emailVerificationOtpAttempts = 0; user.emailVerificationOtpSentAt = new Date(); await user.save();
    const delivered = await sendEmailVerificationOtp(user, emailCode);
    logger.info('New account created; email verification required.');

    return res.status(201).json({
      success: true,
      message: delivered ? 'Account created. Verify your email to continue.' : 'Account created, but email delivery is not configured. Ask an administrator to configure email delivery.',
      verificationRequired: true,
      email: user.email,
      emailSent: delivered,
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

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationOtpAttempts +emailVerificationOtpSentAt');
    if (!user) {
      logger.warn('Rejected login attempt.');
      return res.status(401).json({ success: false, message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Rejected login attempt.');
      return res.status(401).json({ success: false, message: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
    }

    if (!user.emailVerifiedAt) {
      if (isOtpCoolingDown(user.emailVerificationOtpSentAt)) return res.status(403).json({ success: false, code: 'EMAIL_UNVERIFIED', email: user.email, message: 'Your email is not verified. A new code was sent recently; please check your inbox.' });
      const code = generateOtp(); user.emailVerificationOtpHash = hashToken(code); user.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); user.emailVerificationOtpAttempts = 0; user.emailVerificationOtpSentAt = new Date(); await user.save();
      const sent = await sendEmailVerificationOtp(user, code);
      return res.status(403).json({ success: false, code: 'EMAIL_UNVERIFIED', email: user.email, message: sent ? 'Verify your email before signing in. We sent a new code.' : 'Your email is not verified and email delivery is not configured.' });
    }

    const token = await issueSession(user, req);
    await notifyIfAllowed(user, { category: 'security', title: 'New sign-in', message: `${req.get('user-agent') || 'A device'} · ${req.ip || ''}`, link: '/profile', dedupeKey: `login:${Date.now()}:${token}` });
    sendAuthCookie(res, token);

    logger.info('User logged in successfully.');

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toAuthUser(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  const rawToken = req.cookies?.auth_token;
  const decoded = rawToken && require('../utils/jwt').verifyToken(rawToken);
  if (decoded?.jti) await AuthSession.deleteOne({ tokenId: decoded.jti });
  else if (decoded?.id) await AuthSession.deleteOne({ userId: decoded.id, tokenId: `legacy-${require('crypto').createHash('sha256').update(rawToken).digest('hex')}` });
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

const requestEmailVerification = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    const user = await User.findOne({ email }).select('+emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationOtpAttempts +emailVerificationOtpSentAt');
    if (!user || user.emailVerifiedAt) return res.json({ success: true, message: 'If the address needs verification, a code has been sent.' });
    if (isOtpCoolingDown(user.emailVerificationOtpSentAt)) return res.json({ success: true, message: 'If the address needs verification, a code has been sent.' });
    const code = generateOtp(); user.emailVerificationOtpHash = hashToken(code); user.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); user.emailVerificationOtpAttempts = 0; user.emailVerificationOtpSentAt = new Date(); await user.save();
    const sent = await sendEmailVerificationOtp(user, code);
    if (!sent) return res.status(503).json({ success: false, message: 'Email delivery is not configured. Contact the administrator to enable verification email.' });
    res.json({ success: true, message: 'A verification code was sent to your email.' });
  } catch (e) { next(e); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase(); const otp = String(req.body.otp || '').trim();
    if (!validator.isEmail(email) || !/^\d{6}$/.test(otp)) return res.status(400).json({ success: false, message: 'Enter your email and the 6-digit verification code.' });
    const user = await User.findOne({ email }).select('+emailVerificationOtpHash +emailVerificationOtpExpires +emailVerificationOtpAttempts');
    const consumed = await consumeOtp(user, otp, { hashField: 'emailVerificationOtpHash', expiresField: 'emailVerificationOtpExpires', attemptsField: 'emailVerificationOtpAttempts', extraSet: { emailVerifiedAt: new Date() } });
    if (!consumed) return res.status(400).json({ success: false, code: 'INVALID_OTP', message: 'That verification code is invalid, expired, or locked after too many attempts.' });
    await user.save();
    const token = await issueSession(user, req); sendAuthCookie(res, token);
    sendWelcomeEmail(user).catch(err => logger.error('Async welcome email send error:', err));
    res.json({ success: true, message: 'Email verified successfully.', user: user.toAuthUser() });
  } catch (e) { next(e); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar, currentPassword } = req.body;
    const emailChanged = typeof email === 'string' && email.toLowerCase().trim() !== req.user.email;
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required.' });
      req.user.name = name.trim();
    }
    if (email !== undefined && email.toLowerCase().trim() !== req.user.email) {
      if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
      if (!currentPassword) return res.status(400).json({ success: false, message: 'Enter your current password to change your email.' });
      const account = await User.findById(req.user._id).select('+passwordHash');
      if (!await account.comparePassword(currentPassword)) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      const normalizedEmail = email.toLowerCase().trim();
      if (await User.exists({ email: normalizedEmail, _id: { $ne: req.user._id } })) return res.status(409).json({ success: false, message: 'That email address is already in use.' });
      req.user.email = normalizedEmail;
      req.user.emailVerifiedAt = null;
    }
    if (avatar !== undefined) {
      if (avatar && (!/^data:image\/(png|jpeg|webp|gif);base64,/.test(avatar) || avatar.length > 4_000_000)) return res.status(400).json({ success: false, message: 'Upload a supported image smaller than 3 MB.' });
      req.user.avatar = avatar || '';
    }
    if (req.body.notificationPreferences && typeof req.body.notificationPreferences === 'object') {
      const incoming = req.body.notificationPreferences;
      req.user.notificationPreferences = { ...(req.user.notificationPreferences || {}), ...incoming, categories: { ...(req.user.notificationPreferences?.categories || {}), ...(incoming.categories || {}) } };
    }
    await req.user.save();
    let verificationRequired = false; let verificationEmailSent = true;
    if (emailChanged) {
      const code = generateOtp(); req.user.emailVerificationOtpHash = hashToken(code); req.user.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); req.user.emailVerificationOtpAttempts = 0; req.user.emailVerificationOtpSentAt = new Date(); await req.user.save();
      verificationEmailSent = await sendEmailVerificationOtp(req.user, code); verificationRequired = true;
    }
    await notifyIfAllowed(req.user, { category: 'security', title: 'Account profile updated', message: 'Your account information was changed.', link: '/profile', dedupeKey: `profile:${req.user.updatedAt?.getTime() || Date.now()}` });
    res.json({ success: true, user: req.user.toAuthUser(), verificationRequired, verificationEmailSent });
  } catch (error) { next(error); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof newPassword !== 'string' || newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must contain at least 8 characters.' });
    const account = await User.findById(req.user._id).select('+passwordHash');
    if (!await account.comparePassword(currentPassword || '')) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    account.passwordHash = await User.hashPassword(newPassword);
    await account.save();
    if (req.authSessionId) await AuthSession.deleteMany({ userId: req.user._id, tokenId: { $ne: req.authSessionId } });
    await notifyIfAllowed(req.user, { category: 'security', title: 'Password changed', message: 'Your account password was changed.', link: '/profile', dedupeKey: `password:${Date.now()}` });
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) { next(error); }
};

const listSessions = async (req, res, next) => { try { const sessions = await AuthSession.find({ userId: req.user._id, expiresAt: { $gt: new Date() } }).sort({ lastSeenAt: -1 }).lean(); res.json({ success: true, sessions: sessions.map(s => ({ id: s._id, device: s.device, ip: s.ip, lastSeenAt: s.lastSeenAt, current: s.tokenId === req.authSessionId })) }); } catch (e) { next(e); } };
const logoutOtherSessions = async (req, res, next) => { try { if (req.authSessionId) await AuthSession.deleteMany({ userId: req.user._id, tokenId: { $ne: req.authSessionId } }); res.json({ success: true }); } catch (e) { next(e); } };
const requestAccountDeletionOtp = async (req, res, next) => {
  try {
    if (req.body.confirmation !== true || !req.body.currentPassword) return res.status(400).json({ success: false, message: 'Confirm deletion and enter your current password first.' });
    const user = await User.findById(req.user._id).select('+passwordHash +accountDeletionOtpHash +accountDeletionOtpExpires +accountDeletionOtpAttempts +accountDeletionOtpSentAt');
    if (!await user.comparePassword(req.body.currentPassword)) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    if (isOtpCoolingDown(user.accountDeletionOtpSentAt)) return res.status(429).json({ success: false, message: 'A deletion confirmation code was sent recently. Please wait a minute before requesting another.' });
    const code = generateOtp(); user.accountDeletionOtpHash = hashToken(code); user.accountDeletionOtpExpires = new Date(Date.now() + 10 * 60 * 1000); user.accountDeletionOtpAttempts = 0; user.accountDeletionOtpSentAt = new Date(); await user.save();
    if (!await sendAccountDeletionOtp(user, code)) return res.status(503).json({ success: false, message: 'Email delivery is not configured. Contact the administrator to enable deletion verification.' });
    res.json({ success: true, message: `A confirmation code was sent to ${user.email}.` });
  } catch (e) { next(e); }
};
const deleteAccount = async (req, res, next) => {
  try {
    if (req.body.confirmation !== true || !req.body.currentPassword || !/^\d{6}$/.test(String(req.body.otp || ''))) return res.status(400).json({ success: false, message: 'Confirm deletion, enter your password, and provide the email code.' });
    const account = await User.findById(req.user._id).select('+passwordHash +googleAccessToken +googleRefreshToken +githubAccessToken +accountDeletionOtpHash +accountDeletionOtpExpires +accountDeletionOtpAttempts');
    if (!await account.comparePassword(req.body.currentPassword)) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    const deletionOtpConsumed = await consumeOtp(account, String(req.body.otp), { hashField: 'accountDeletionOtpHash', expiresField: 'accountDeletionOtpExpires', attemptsField: 'accountDeletionOtpAttempts' });
    if (!deletionOtpConsumed) return res.status(400).json({ success: false, message: 'The email code is invalid, expired, or locked after too many attempts.' });
    const { unseal } = require('../utils/crypto');
    if (account.googleRefreshToken || account.googleAccessToken) { const token = account.googleRefreshToken ? unseal(account.googleRefreshToken) : unseal(account.googleAccessToken); if (token) await fetch('https://oauth2.googleapis.com/revoke', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token }) }).catch(() => {}); }
    if (account.githubAccessToken) { const token = unseal(account.githubAccessToken); if (token) await fetch('https://api.github.com/applications/' + config.github.clientId + '/grant', { method: 'DELETE', headers: { Accept: 'application/vnd.github+json', Authorization: `Basic ${Buffer.from(`${config.github.clientId}:${config.github.clientSecret}`).toString('base64')}`, 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' }, body: JSON.stringify({ access_token: token }) }).catch(() => {}); }
    await Promise.all([Task.deleteMany({ userId: req.user._id }), CalendarEvent.deleteMany({ userId: req.user._id }), Notification.deleteMany({ userId: req.user._id }), AuthSession.deleteMany({ userId: req.user._id })]);
    await User.deleteOne({ _id: req.user._id }); res.clearCookie('auth_token'); res.json({ success: true, message: 'Account and Digital Desk data removed.' });
  } catch (e) { next(e); }
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
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts +passwordResetOtpSentAt');

    if (!user) {
      return res.status(200).json({ success: true, message: safeGenericMessage });
    }

    if (isOtpCoolingDown(user.passwordResetOtpSentAt)) return res.status(200).json({ success: true, message: safeGenericMessage });

    const otpCode = generateOtp();
    const { rawToken, hashedToken } = generateResetToken();

    user.passwordResetOtpHash = hashToken(otpCode);
    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetOtpAttempts = 0;
    user.passwordResetOtpSentAt = new Date();
    await user.save();

    sendOtpEmail(user, otpCode).catch(err => logger.error('Async OTP email error:', err));

    logger.info('Password reset OTP requested for an account.');

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

    if (typeof otp === 'string' && typeof email === 'string') {
      const normalizedEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: normalizedEmail }).select('+passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts');
      const consumed = await consumeOtp(user, otp.trim(), { hashField: 'passwordResetOtpHash', expiresField: 'passwordResetOtpExpires', attemptsField: 'passwordResetOtpAttempts', extraSet: { passwordResetTokenHash: null, passwordResetExpires: null } });
      if (!consumed) user = null;
    } else if (typeof token === 'string' && token) {
      const hashedToken = hashToken(token);
      user = await User.findOneAndUpdate({
        passwordResetTokenHash: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }, { $set: { passwordResetTokenHash: null, passwordResetExpires: null, passwordResetOtpHash: null, passwordResetOtpExpires: null, passwordResetOtpAttempts: 0 } }, { new: true });
    } else {
      return res.status(400).json({ success: false, message: 'OTP code or reset token is required.', code: 'VALIDATION_ERROR' });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 6-digit OTP code.', code: 'INVALID_OTP' });
    }

    user.passwordHash = await User.hashPassword(password);
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpires = null;
    user.passwordResetOtpAttempts = 0;
    await user.save();
    await AuthSession.deleteMany({ userId: user._id });
    await notifyIfAllowed(user, { category: 'security', title: 'Password reset', message: 'Your account password was reset. Sign in again on your devices.', link: '/login', dedupeKey: `password-reset:${Date.now()}` });

    logger.info('Password successfully reset for an account.');

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
    if (!config.github.clientId || !config.github.clientSecret) return res.redirect(`${config.frontendUrl}/settings?error=github_not_configured`);
    if (!code) {
      return res.redirect(`${config.frontendUrl}/settings?error=github_cancelled`);
    }
    if (!state || state !== req.cookies.github_connect_state) return res.redirect(`${config.frontendUrl}/settings?error=github_state`);
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
      logger.warn('GitHub OAuth token exchange was rejected.');
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

    logger.info('GitHub integration connected.');

    return res.redirect(`${config.frontendUrl}/settings?connected=github`);
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
      logger.warn('Google OAuth token exchange was rejected.');
      return res.redirect(`${config.frontendUrl}/login?error=google_token_failed`);
    }

    // Fetch Google profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleProfile = await userResponse.json();
    if (!googleProfile.email || !validator.isEmail(googleProfile.email)) return res.redirect(`${config.frontendUrl}/login?error=google_email`);
    const targetEmail = googleProfile.email.toLowerCase();
    const googleEmailVerified = googleProfile.verified_email === true;

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = await User.create({
        name: googleProfile.name,
        email: targetEmail,
        emailVerifiedAt: googleEmailVerified ? new Date() : null,
        passwordHash: await User.hashPassword(generateOtp() + 'GoogleAuth!'),
        avatar: googleProfile.picture,
        googleEmail: targetEmail,
        googleAccessToken: seal(accessToken),
        googleRefreshToken: refreshToken ? seal(refreshToken) : '',
      });
      if (googleEmailVerified) sendWelcomeEmail(user).catch(() => {});
    } else {
      user.googleEmail = targetEmail;
      user.googleAccessToken = seal(accessToken);
      if (refreshToken) user.googleRefreshToken = seal(refreshToken);
      if (googleProfile.picture) user.avatar = googleProfile.picture;
      if (googleEmailVerified && !user.emailVerifiedAt) user.emailVerifiedAt = new Date();
      await user.save();
    }

    const token = await issueSession(user, req);
    sendAuthCookie(res, token);

    logger.info('Google sign-in completed successfully.');

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
    if (!req.query.code || req.query.state !== req.cookies.google_connect_state) return res.redirect(`${config.frontendUrl}/settings?error=google_state`);
    res.clearCookie('google_connect_state');
    const callbackUrl = config.google.callbackUrl || `${config.backendUrl}/api/integrations/google/callback`;
    const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: req.query.code, client_id: config.google.clientId, client_secret: config.google.clientSecret, redirect_uri: callbackUrl, grant_type: 'authorization_code' }) });
    const tokens = await response.json();
    if (!response.ok || !tokens.access_token) return res.redirect(`${config.frontendUrl}/settings?error=google_token`);
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = await profileResponse.json();
    const userId = req.cookies.auth_token && require('../utils/jwt').verifyToken(req.cookies.auth_token)?.id;
    const user = userId ? await User.findById(userId) : null;
    if (!user) return res.redirect(`${config.frontendUrl}/login?error=google_account`);
    user.googleEmail = profile.email || '';
    user.googleAccessToken = seal(tokens.access_token);
    if (tokens.refresh_token) user.googleRefreshToken = seal(tokens.refresh_token);
    await user.save();
    res.redirect(`${config.frontendUrl}/settings?connected=google`);
  } catch (error) { next(error); }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  listSessions,
  logoutOtherSessions,
  requestAccountDeletionOtp,
  deleteAccount,
  requestEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  githubAuth,
  githubCallback,
  googleAuth,
  googleCallback,
  googleConnectStart,
  googleConnectCallback,
};
