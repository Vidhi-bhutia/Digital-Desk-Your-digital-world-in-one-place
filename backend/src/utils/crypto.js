const crypto = require('crypto');

/**
 * Generates a unhashed random token and a hashed SHA-256 version.
 * @returns {{ rawToken: string, hashedToken: string }}
 */
const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  return { rawToken, hashedToken };
};

/**
 * Generates a random 6-digit OTP string (e.g. "482910")
 * @returns {string}
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hashes a raw token/OTP with SHA-256
 * @param {string} token 
 * @returns {string}
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateResetToken,
  generateOtp,
  hashToken,
};
