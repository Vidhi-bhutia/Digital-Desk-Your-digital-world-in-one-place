const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let memoryServer = null;

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    
    // Attempt standard connection to MONGO_URI
    logger.info(`Connecting to MongoDB at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    logger.info(`MongoDB connected successfully to database: ${mongoose.connection.name}`);
  } catch (error) {
    logger.warn(`Primary MongoDB connection failed: ${error.message}`);
    
    // In development mode, if local MongoDB server is not running, fallback to memory-server for zero-friction setup
    if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
      try {
        logger.info('Starting fallback in-memory MongoDB server for development/testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: { dbName: 'digitaldesk' }
        });
        const memoryUri = memoryServer.getUri();
        await mongoose.connect(memoryUri);
        logger.info(`Fallback MongoDB connected in-memory at ${memoryUri}`);
        return;
      } catch (memError) {
        logger.error('Failed to start in-memory MongoDB fallback:', memError);
      }
    }
    
    logger.error('Database connection failed catastrophically. Application shutting down.');
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    logger.info('MongoDB disconnected.');
  } catch (error) {
    logger.error('Error disconnecting MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
