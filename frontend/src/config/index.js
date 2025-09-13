/**
 * Frontend Configuration Management
 * Handles environment variables and default values for the frontend
 */

const config = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  },

  // GitHub Configuration
  GITHUB: {
    URL_PATTERN: /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/)?$/,
  },

  // UI Configuration
  UI: {
    PROGRESS_STEPS: [
      { title: 'Connect Repository', description: 'Link your GitHub repository' },
      { title: 'Review Details', description: 'Verify repository analysis' },
      { title: 'Choose Role', description: 'Select your role for personalized docs' },
      { title: 'Generate Docs', description: 'Create comprehensive documentation' },
      { title: 'Complete', description: 'Review your pull request' }
    ],
    TOAST_DURATION: 4000,
    ANIMATION_DURATION: 300,
  },

  // Documentation Configuration
  DOCS: {
    SUPPORTED_ROLES: ['backend', 'frontend', 'product-manager', 'devops'],
    PREVIEW_TRUNCATE_LENGTH: 500,
  },

  // Development Configuration
  DEV: {
    ENABLE_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
  }
};

// Validation helper
export const validateGitHubUrl = (url) => {
  return config.GITHUB.URL_PATTERN.test(url);
};

// Extract owner and repo from GitHub URL
export const parseGitHubUrl = (url) => {
  const match = url.match(config.GITHUB.URL_PATTERN);
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2]
  };
};

// Log helper for development
export const devLog = (...args) => {
  if (config.DEV.ENABLE_LOGGING) {
    console.log('[DocFlow]', ...args);
  }
};

// Debug helper
export const debugLog = (...args) => {
  if (config.DEV.ENABLE_DEBUG) {
    console.debug('[DEBUG]', ...args);
  }
};

export default config;