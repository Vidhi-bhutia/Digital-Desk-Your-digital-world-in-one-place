const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`Digital Desk Backend API running on port ${config.port} in [${config.nodeEnv}] mode`);
      logger.info(`Health check available at: ${config.backendUrl}/api/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} signal received. Closing HTTP server and database connections...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
