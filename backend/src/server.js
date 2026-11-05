const dns = require('dns');
const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map(value => value.trim()).filter(Boolean));
} else if (config.nodeEnv === 'development') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const startServer = async () => {
  try {
    if (config.nodeEnv === 'production') {
      const missing = [
        ['JWT_SECRET', config.jwtSecret],
        ['COOKIE_SECRET', config.cookieSecret],
        ['ENCRYPTION_KEY', config.encryptionKey],
      ].filter(([, value]) => !value || value.length < 32 || /fallback|replace|your_/i.test(value)).map(([name]) => name);
      if (missing.length) throw new Error(`Production requires distinct secrets of at least 32 characters: ${missing.join(', ')}.`);
      if (config.jwtSecret === config.cookieSecret || config.jwtSecret === config.encryptionKey || config.cookieSecret === config.encryptionKey) throw new Error('JWT_SECRET, COOKIE_SECRET, and ENCRYPTION_KEY must all be distinct values.');
      if (!config.frontendUrls.every(url => url.startsWith('https://'))) throw new Error('Production FRONTEND_URL origins must use HTTPS.');
      if (!config.mongoUri.startsWith('mongodb+srv://') && !/[?&](tls|ssl)=true/i.test(config.mongoUri)) throw new Error('Production MONGO_URI must enable TLS.');
    }
    await connectDB();
    const server = app.listen(config.port, () => logger.info(`Digital Desk API listening on ${config.port}`));
    const shutdown = () => server.close(async () => { await disconnectDB(); process.exit(0); });
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server; persistent database connection is required:', error);
    process.exit(1);
  }
};

// Vercel's Express adapter imports this supported entry point and expects the
// app export. `npm start` still launches the standalone local server.
if (require.main === module) startServer();

module.exports = app;
