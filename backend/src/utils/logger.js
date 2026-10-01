const config = require('../config/env');

const sanitize = (data) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'jwt', 'secret', 'authorization', 'cookie'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  return sanitized;
};

const logger = {
  info: (message, meta = null) => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.log(`[${timestamp}] [INFO] ${message}`, sanitize(meta));
    } else {
      console.log(`[${timestamp}] [INFO] ${message}`);
    }
  },
  warn: (message, meta = null) => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.warn(`[${timestamp}] [WARN] ${message}`, sanitize(meta));
    } else {
      console.warn(`[${timestamp}] [WARN] ${message}`);
    }
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    if (error) {
      const errorDetails = error instanceof Error 
        ? { message: error.message, stack: config.nodeEnv === 'development' ? error.stack : undefined }
        : sanitize(error);
      console.error(`[${timestamp}] [ERROR] ${message}`, errorDetails);
    } else {
      console.error(`[${timestamp}] [ERROR] ${message}`);
    }
  }
};

module.exports = logger;
