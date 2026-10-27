const config = require('../config/env');
const { unseal, seal } = require('../utils/crypto');

const GOOGLE_API = 'https://www.googleapis.com';
const getGoogleAccessToken = async (user) => {
  if (!user.googleAccessToken && !user.googleRefreshToken) throw Object.assign(new Error('Google is not connected.'), { status: 409 });
  let accessToken = '';
  try { accessToken = unseal(user.googleAccessToken); } catch { accessToken = ''; }
  if (accessToken) {
    const check = await fetch(`${GOOGLE_API}/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`, { signal: AbortSignal.timeout(8000) });
    if (check.ok) return accessToken;
  }
  if (!user.googleRefreshToken || !config.google.clientId || !config.google.clientSecret) throw Object.assign(new Error('Google access expired or revoked. Reconnect Google.'), { status: 401 });
  let refreshToken;
  try { refreshToken = unseal(user.googleRefreshToken); } catch { throw Object.assign(new Error('Google credentials cannot be decrypted. Reconnect Google.'), { status: 401 }); }
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: config.google.clientId, client_secret: config.google.clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }), signal: AbortSignal.timeout(8000) });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw Object.assign(new Error('Google access expired or revoked. Reconnect Google.'), { status: 401 });
  user.googleAccessToken = seal(body.access_token); await user.save();
  return body.access_token;
};

const googleFetch = async (user, path, options = {}) => {
  const token = await getGoogleAccessToken(user);
  const response = await fetch(`${GOOGLE_API}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, signal: AbortSignal.timeout(10000) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error?.message || `Google API request failed (${response.status}).`), { status: response.status === 403 ? 403 : response.status === 401 ? 401 : 502 });
  return body;
};

module.exports = { getGoogleAccessToken, googleFetch };
