const config = require('../config/env');
const { seal, unseal } = require('../utils/crypto');
const User = require('../models/User');

const getIntegrationStatus = async (req, res) => {
  const user = await require('../models/User').findById(req.user._id).select('+githubAccessToken +googleAccessToken +googleRefreshToken');
  const status = {
    github: { connected: false, username: user.githubUsername || null, error: null },
    google: { connected: false, email: user.googleEmail || null, gmail: false, calendar: false, errors: {} },
    openweather: { configured: !!config.openWeatherApiKey },
  };
  if (user.githubAccessToken) {
    try {
      const token = unseal(user.githubAccessToken);
      const r = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Digital-Desk' }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) throw new Error(r.status === 401 ? 'GitHub authorization expired or was revoked.' : `GitHub validation failed (${r.status}).`);
      const profile = await r.json(); status.github = { connected: true, username: profile.login, error: null };
    } catch (error) { status.github.error = error.message; }
  }
  if (user.googleAccessToken || user.googleRefreshToken) {
    status.google.connected = true;
    const { googleFetch } = require('../services/googleService');
    const checks = await Promise.allSettled([
      googleFetch(user, '/gmail/v1/users/me/labels/UNREAD'),
      googleFetch(user, `/calendar/v3/calendars/primary/events?maxResults=1&timeMin=${encodeURIComponent(new Date().toISOString())}`),
    ]);
    status.google.gmail = checks[0].status === 'fulfilled';
    status.google.calendar = checks[1].status === 'fulfilled';
    if (!status.google.gmail) status.google.errors.gmail = checks[0].reason.message;
    if (!status.google.calendar) status.google.errors.calendar = checks[1].reason.message;
    status.google.connected = status.google.gmail || status.google.calendar;
  }
  res.json({ success: true, integrations: status });
};

const connectGitHub = async (req, res) => {
  const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
  if (!token) return res.status(400).json({ success: false, message: 'A GitHub personal access token is required. A username does not authorize account access.' });
  const response = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Digital-Desk' } });
  if (!response.ok) return res.status(response.status === 401 ? 401 : 502).json({ success: false, message: response.status === 401 ? 'GitHub rejected this token.' : `GitHub validation failed (${response.status}).` });
  const profile = await response.json();
  req.user.githubUsername = profile.login;
  req.user.githubAccessToken = seal(token);
  await req.user.save();
  res.json({ success: true, integration: { connected: true, username: profile.login } });
};

const connectGoogle = async (_req, res) => res.status(400).json({ success: false, message: 'Start Google OAuth at /api/auth/google/connect. An email address alone cannot connect a Google account.' });

const disconnectProvider = async (req, res) => {
  const provider = req.params.provider.toLowerCase();
  if (provider === 'github') { req.user.githubUsername = ''; req.user.githubAccessToken = ''; }
  else if (provider === 'google' || provider === 'gmail' || provider === 'calendar') {
    req.user.googleEmail = ''; req.user.googleAccessToken = ''; req.user.googleRefreshToken = '';
  } else return res.status(404).json({ success: false, message: 'Unknown integration.' });
  await req.user.save();
  res.json({ success: true, message: `${provider} disconnected.` });
};

module.exports = { getIntegrationStatus, connectGitHub, connectGoogle, disconnectProvider };
