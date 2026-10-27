const config = require('../config/env');
const logger = require('../utils/logger');

// In-memory or database user integrations store
const userIntegrationsStore = new Map();

const getIntegrationStatus = async (req, res) => {
  const userId = req.user._id.toString();
  const userIntegrations = userIntegrationsStore.get(userId) || {
    github: { connected: true, username: 'Vidhi-bhutia', lastSynced: new Date() },
    google: { connected: true, email: req.user.email, services: ['Gmail', 'Google Calendar'], lastSynced: new Date() },
    openweather: { connected: true, city: 'Indore, India', apiKeySet: !!config.openWeatherApiKey },
  };

  return res.status(200).json({
    success: true,
    integrations: userIntegrations,
  });
};

const connectGitHub = async (req, res) => {
  const userId = req.user._id.toString();
  const { username, token } = req.body;

  const current = userIntegrationsStore.get(userId) || {};
  current.github = {
    connected: true,
    username: username || 'Vidhi-bhutia',
    tokenProvided: !!token,
    lastSynced: new Date(),
  };

  userIntegrationsStore.set(userId, current);

  logger.info(`GitHub connected for user ${req.user.email}: @${current.github.username}`);

  return res.status(200).json({
    success: true,
    message: `GitHub account @${current.github.username} connected successfully.`,
    integration: current.github,
  });
};

const connectGoogle = async (req, res) => {
  const userId = req.user._id.toString();
  const { email } = req.body;

  const current = userIntegrationsStore.get(userId) || {};
  current.google = {
    connected: true,
    email: email || req.user.email,
    services: ['Gmail', 'Google Calendar', 'Google Meet'],
    lastSynced: new Date(),
  };

  userIntegrationsStore.set(userId, current);

  logger.info(`Google services connected for user ${req.user.email}`);

  return res.status(200).json({
    success: true,
    message: `Google Account (${current.google.email}) connected successfully.`,
    integration: current.google,
  });
};

const disconnectProvider = async (req, res) => {
  const userId = req.user._id.toString();
  const { provider } = req.params;

  const current = userIntegrationsStore.get(userId) || {};
  if (current[provider]) {
    current[provider].connected = false;
  }
  userIntegrationsStore.set(userId, current);

  return res.status(200).json({
    success: true,
    message: `${provider} disconnected.`,
  });
};

module.exports = {
  getIntegrationStatus,
  connectGitHub,
  connectGoogle,
  disconnectProvider,
};
