require('dotenv').config();

/**
 * Centralized Configuration Management
 * All environment variables and default values are defined here
 */

const config = {
  // Server Configuration
  SERVER: {
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  // API Configuration
  API: {
    TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000, // 30 seconds
    BODY_LIMIT: process.env.BODY_LIMIT || '10mb',
    REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 60000, // 1 minute
  },

  // Rate Limiting Configuration
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    SKIP_SUCCESSFUL_REQUESTS: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
    SKIP_FAILED_REQUESTS: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
  },

  // GitHub API Configuration
  GITHUB: {
    TOKEN: process.env.GITHUB_TOKEN,
    FILE_LIMIT: parseInt(process.env.GITHUB_FILE_LIMIT) || 10,
    MAX_FILE_SIZE: parseInt(process.env.GITHUB_MAX_FILE_SIZE) || 50000, // 50KB
    CONTENT_TRUNCATE_SIZE: parseInt(process.env.GITHUB_CONTENT_TRUNCATE) || 1000,
    CONFIG_FILES_LIMIT: parseInt(process.env.GITHUB_CONFIG_FILES_LIMIT) || 5,
    ARCHITECTURAL_FILES_LIMIT: parseInt(process.env.GITHUB_ARCH_FILES_LIMIT) || 8,
    SOURCE_FILES_LIMIT: parseInt(process.env.GITHUB_SOURCE_FILES_LIMIT) || 10,
    BATCH_SIZE: parseInt(process.env.GITHUB_BATCH_SIZE) || 20,
    DEPENDENCIES_SLICE: parseInt(process.env.GITHUB_DEPENDENCIES_SLICE) || 3,
  },

  // AI/Gemini Configuration
  AI: {
    API_KEY: process.env.GEMINI_API_KEY,
    MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    MAX_RETRIES: parseInt(process.env.AI_MAX_RETRIES) || 3,
    RETRY_DELAY_BASE: parseInt(process.env.AI_RETRY_DELAY_BASE) || 1000, // Base delay in ms
    TIMEOUT: parseInt(process.env.AI_TIMEOUT) || 60000, // 1 minute
    MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS) || 8192,
  },

  // File Processing Configuration
  FILES: {
    MAX_CONCURRENT_REQUESTS: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 5,
    RETRY_ATTEMPTS: parseInt(process.env.FILE_RETRY_ATTEMPTS) || 3,
    CHUNK_SIZE: parseInt(process.env.FILE_CHUNK_SIZE) || 1024 * 1024, // 1MB
  },

  // Documentation Generation Configuration
  DOCS: {
    MAX_FEATURES_COUNT: parseInt(process.env.DOCS_MAX_FEATURES) || 3,
    MAX_FUNCTIONS_COUNT: parseInt(process.env.DOCS_MAX_FUNCTIONS) || 10,
    MAX_DEPENDENCIES_COUNT: parseInt(process.env.DOCS_MAX_DEPENDENCIES) || 20,
    GENERATION_TIMEOUT: parseInt(process.env.DOCS_GENERATION_TIMEOUT) || 120000, // 2 minutes
  },

  // Security Configuration
  SECURITY: {
    HELMET_ENABLED: process.env.HELMET_ENABLED !== 'false',
    CORS_ENABLED: process.env.CORS_ENABLED !== 'false',
    TRUST_PROXY: process.env.TRUST_PROXY !== 'false',
  },

  // Logging Configuration
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING === 'true',
    ENABLE_ERROR_STACK: process.env.NODE_ENV === 'development',
  },

  // Database Configuration (for future use)
  DATABASE: {
    URL: process.env.DATABASE_URL,
    MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
    TIMEOUT: parseInt(process.env.DB_TIMEOUT) || 30000,
  },
};

/**
 * Validation function to check required environment variables
 */
function validateConfig() {
  const requiredVars = [
    { key: 'GITHUB_TOKEN', value: config.GITHUB.TOKEN, message: 'GitHub token is required' },
    { key: 'GEMINI_API_KEY', value: config.AI.API_KEY, message: 'Gemini API key is required' },
  ];

  const missing = requiredVars.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(({ key, message }) => {
      console.error(`   - ${key}: ${message}`);
    });
    throw new Error('Configuration validation failed');
  }

  // Validate numeric values
  const numericValidations = [
    { key: 'RATE_LIMIT.MAX_REQUESTS', value: config.RATE_LIMIT.MAX_REQUESTS, min: 1 },
    { key: 'GITHUB.FILE_LIMIT', value: config.GITHUB.FILE_LIMIT, min: 1, max: 50 },
    { key: 'AI.MAX_RETRIES', value: config.AI.MAX_RETRIES, min: 1, max: 10 },
  ];

  numericValidations.forEach(({ key, value, min, max }) => {
    if (value < min || (max && value > max)) {
      console.warn(`⚠️  ${key} value ${value} is outside recommended range [${min}-${max || '∞'}]`);
    }
  });
}

/**
 * Display configuration summary
 */
function displayConfigSummary() {
  console.log('🔧 Configuration Summary:');
  console.log(`   Environment: ${config.SERVER.NODE_ENV}`);
  console.log(`   Port: ${config.SERVER.PORT}`);
  console.log(`   GitHub Token: ${config.GITHUB.TOKEN ? 'Present ✅' : 'Missing ❌'}`);
  console.log(`   Gemini API Key: ${config.AI.API_KEY ? 'Present ✅' : 'Missing ❌'}`);
  console.log(`   AI Model: ${config.AI.MODEL}`);
  console.log(`   Rate Limit: ${config.RATE_LIMIT.MAX_REQUESTS} requests per ${config.RATE_LIMIT.WINDOW_MS / 1000}s`);
  console.log(`   File Limits: ${config.GITHUB.FILE_LIMIT} files, ${config.GITHUB.MAX_FILE_SIZE} bytes max`);
}

// Validate configuration on module load
validateConfig();

// Display summary in development
if (config.SERVER.NODE_ENV === 'development') {
  displayConfigSummary();
}

module.exports = config;