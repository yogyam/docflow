require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Debug environment variables
console.log('🔍 Environment check:');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'Present ✅' : 'Missing ❌');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present ✅' : 'Missing ❌');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || '3001 (default)');

const githubRoutes = require('./routes/github');
const simpleDocRoutes = require('./routes/simpleDocGeneration');

// Only load chat routes if Gemini is available
let chatRoutes = null;
if (process.env.GEMINI_API_KEY) {
  chatRoutes = require('./routes/chat');
  console.log('✅ Chat routes loaded with Gemini AI integration');
} else {
  console.warn('⚠️  Gemini API key missing - chat functionality disabled');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/github', githubRoutes);
app.use('/api/generate', simpleDocRoutes);

// Only enable chat routes if Gemini AI is available
if (chatRoutes) {
  app.use('/api/chat', chatRoutes);
} else {
  // Provide a simple fallback for chat endpoints
  app.use('/api/chat', (req, res) => {
    res.status(503).json({ 
      error: 'Chat service unavailable', 
      message: 'Gemini API key not configured. Add GEMINI_API_KEY to enable chat functionality.' 
    });
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 DocFlow Lite Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
