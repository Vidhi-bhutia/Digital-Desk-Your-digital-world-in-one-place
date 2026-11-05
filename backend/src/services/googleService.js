const config = require('../config/env');
const { unseal, seal } = require('../utils/crypto');

const GOOGLE_API = 'https://www.googleapis.com';
const getGoogleAccessToken = async (user, forceRefresh = false) => {
  if (!user.googleAccessToken && !user.googleRefreshToken) throw Object.assign(new Error('Google is not connected.'), { status: 409 });
  let accessToken = '';
  try { accessToken = unseal(user.googleAccessToken); } catch { accessToken = ''; }
  // Google API calls validate the access token themselves. Checking tokeninfo
  // first adds a full network round trip to every Gmail and Calendar request.
  if (accessToken && !forceRefresh) return accessToken;
  if (!user.googleRefreshToken || !config.google.clientId || !config.google.clientSecret) throw Object.assign(new Error('Google access expired or revoked. Reconnect Google.'), { status: 401 });
  let refreshToken;
  try { refreshToken = unseal(user.googleRefreshToken); } catch { throw Object.assign(new Error('Google credentials cannot be decrypted. Reconnect Google.'), { status: 401 }); }
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: config.google.clientId, client_secret: config.google.clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }), signal: AbortSignal.timeout(8000) });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw Object.assign(new Error('Google access expired or revoked. Reconnect Google.'), { status: 401 });
  const encryptedAccessToken = seal(body.access_token);
  // Concurrent Gmail, Calendar, search and activity calls can refresh at once.
  // Do not call save() on their shared Mongoose document in parallel.
  await require('../models/User').updateOne({ _id: user._id }, { $set: { googleAccessToken: encryptedAccessToken } });
  user.googleAccessToken = encryptedAccessToken;
  return body.access_token;
};

const googleFetch = async (user, path, options = {}) => {
  const request = token => fetch(`${GOOGLE_API}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, signal: AbortSignal.timeout(10000) });
  let response = await request(await getGoogleAccessToken(user));
  if (response.status === 401 && user.googleRefreshToken) response = await request(await getGoogleAccessToken(user, true));
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error?.message || `Google API request failed (${response.status}).`), { status: response.status === 403 ? 403 : response.status === 401 ? 401 : response.status === 409 ? 409 : 502 });
  return body;
};

module.exports = { getGoogleAccessToken, googleFetch };
