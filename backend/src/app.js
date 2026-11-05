const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', config.trustProxyHops);

// Security headers
app.use(helmet({ strictTransportSecurity: config.nodeEnv === 'production' ? undefined : false }));
app.use((req, res, next) => { res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)'); next(); });

// CORS compares serialized origins. In development Vite may choose another port
// or be opened via localhost/127.0.0.1; production stays on explicit origins.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const normalizeOrigin = (value) => {
  try { return new URL(value).origin; } catch { return null; }
};
const configuredOrigins = (config.frontendUrls || [config.frontendUrl]).map(normalizeOrigin).filter(Boolean);
const isAllowedOrigin = (origin) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  if (configuredOrigins.includes(normalized)) return true;
  if (config.nodeEnv !== 'production') {
    if (allowedOrigins.includes(normalized)) return true;
    try {
      const url = new URL(normalized);
      return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && ['http:', 'https:'].includes(url.protocol);
    } catch { return false; }
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      const error = new Error('Origin is not allowed by CORS');
      error.status = 403;
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Origin checks protect cookie-authenticated state changes from cross-site
// requests. Non-browser clients without an Origin header remain supported.
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || !req.get('origin')) return next();
  if (isAllowedOrigin(req.get('origin'))) return next();
  return res.status(403).json({ success: false, code: 'CSRF_ORIGIN_REJECTED', message: 'Request origin is not allowed.' });
});

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false, message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests. Please wait and try again.' } }));
app.use('/api/auth', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// Body parsing middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb', parameterLimit: 100 }));

// Cookie parsing
app.use(cookieParser(config.cookieSecret));

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    appName: 'Digital Desk API',
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Phase 2 Feature APIs (Tasks, Calendar, Gmail, GitHub, Weather, Activity, Search, Music)
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
