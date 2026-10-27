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

startServer();
