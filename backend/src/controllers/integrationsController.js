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
  const fullRemoval = req.body?.revoke === true;
  const disconnectOnly = req.body?.revoke === false;
  const user = await User.findById(req.user._id).select('+githubAccessToken +googleAccessToken +googleRefreshToken');
  if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
  if (provider === 'github') {
    if (disconnectOnly && user.githubAccessToken) return res.status(400).json({ success: false, message: 'GitHub OAuth Apps do not support local-only credential removal safely. Use complete removal to revoke the grant.' });
    if (fullRemoval && user.githubAccessToken) {
      if (!config.github.clientId || !config.github.clientSecret) return res.status(503).json({ success: false, message: 'GitHub revocation is not configured. The connection was kept so it can be safely retried.' });
      let token;
      try { token = unseal(user.githubAccessToken); } catch { return res.status(409).json({ success: false, message: 'The stored GitHub credential cannot be read. Reconnect GitHub before removing it.' }); }
      const response = await fetch(`https://api.github.com/applications/${encodeURIComponent(config.github.clientId)}/grant`, { method: 'DELETE', headers: { Authorization: `Basic ${Buffer.from(`${config.github.clientId}:${config.github.clientSecret}`).toString('base64')}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'Digital-Desk' }, body: JSON.stringify({ access_token: token }), signal: AbortSignal.timeout(10000) });
      if (!response.ok) return res.status(response.status >= 500 ? 503 : 502).json({ success: false, pending: response.status >= 500, message: 'GitHub did not confirm revocation. The local connection was kept; retry removal later.' });
    }
    user.githubUsername = ''; user.githubAccessToken = '';
  } else if (provider === 'google' || provider === 'gmail' || provider === 'calendar') {
    if (disconnectOnly) return res.status(400).json({ success: false, message: 'Google Disconnect must revoke the grant to avoid leaving active authorization behind. Use complete removal.' });
    if (fullRemoval) {
      const credentials = [];
      for (const stored of [user.googleAccessToken, user.googleRefreshToken]) {
        if (!stored) continue;
        try { credentials.push(unseal(stored)); } catch { return res.status(409).json({ success: false, message: 'A stored Google credential cannot be read. The local connection was kept for safe recovery.' }); }
      }
      // Revoking the refresh token revokes the Google grant and its derived access tokens.
      const tokensToRevoke = user.googleRefreshToken ? [credentials[1]] : credentials.slice(0, 1);
      for (const token of [...new Set(tokensToRevoke.filter(Boolean))]) {
        const response = await fetch('https://oauth2.googleapis.com/revoke', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token }), signal: AbortSignal.timeout(10000) });
        if (!response.ok) return res.status(response.status >= 500 ? 503 : 502).json({ success: false, pending: response.status >= 500, message: 'Google did not confirm revocation. The local connection was kept; retry removal later.' });
      }
    }
    user.googleEmail = ''; user.googleAccessToken = ''; user.googleRefreshToken = '';
  } else return res.status(404).json({ success: false, message: 'Unknown integration.' });
  await user.save();
  res.json({ success: true, revoked: fullRemoval, message: fullRemoval ? `${provider} authorization revoked and local connection removed.` : `${provider} disconnected locally.` });
};

module.exports = { getIntegrationStatus, connectGitHub, connectGoogle, disconnectProvider };
