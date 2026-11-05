const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const logger = require('../src/utils/logger');

// Vercel invokes API functions per request; unlike src/server.js, it does not
// rely on a long-running app.listen() startup to establish MongoDB first.
module.exports = async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    logger.error('Vercel request could not connect to MongoDB:', error);
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      message: 'The database is temporarily unavailable. Please try again shortly.',
    });
  }
};
