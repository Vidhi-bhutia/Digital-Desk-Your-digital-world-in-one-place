const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  mongoose.set('strictQuery', true);
  const uri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/digitaldesk_test' : config.mongoUri;
  connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      logger.info(`MongoDB connected to ${mongoose.connection.name}`);
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });
  return connectionPromise;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  connectionPromise = null;
  logger.info('MongoDB disconnected.');
};

module.exports = { connectDB, disconnectDB };
