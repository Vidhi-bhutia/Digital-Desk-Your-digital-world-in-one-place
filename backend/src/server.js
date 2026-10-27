
import dns from 'node:dns';

// Configure DNS before connecting to MongoDB
dns.setServers(['8.8.8.8', '1.1.1.1']);

import app from './app.js';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';

const PORT = config.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Digital Desk backend running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down server...`);

      server.close(async () => {
        try {
          await disconnectDB();
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
