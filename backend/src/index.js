const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import centralized configuration
const config = require('./config');

const githubRoutes = require('./routes/github');
const simpleDocRoutes = require('./routes/simpleDocGeneration');

const app = express();
const PORT = config.SERVER.PORT;

// Trust proxy for rate limiting
if (config.SECURITY.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Security middleware
if (config.SECURITY.HELMET_ENABLED) {
  app.use(helmet());
}

if (config.SECURITY.CORS_ENABLED) {
  app.use(cors({
    origin: config.SERVER.FRONTEND_URL,
    credentials: true
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  skipSuccessfulRequests: config.RATE_LIMIT.SKIP_SUCCESSFUL_REQUESTS,
  skipFailedRequests: config.RATE_LIMIT.SKIP_FAILED_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: config.API.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/github', githubRoutes);
app.use('/api/generate', simpleDocRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.LOGGING.ENABLE_ERROR_STACK ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 DocFlow Lite Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${config.SERVER.NODE_ENV}`);
});

module.exports = app;
