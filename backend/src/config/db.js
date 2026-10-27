const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const uri = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/digitaldesk_test' : config.mongoUri;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  logger.info(`MongoDB connected to ${mongoose.connection.name}`);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected.');
};

module.exports = { connectDB, disconnectDB };
