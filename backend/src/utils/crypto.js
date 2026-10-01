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
 * Hashes a raw token with SHA-256
 * @param {string} token 
 * @returns {string}
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateResetToken,
  hashToken,
};
