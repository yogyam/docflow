import axios from 'axios';
import config, { devLog, debugLog } from '../config';

const BASE_URL = config.API.BASE_URL;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: config.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    devLog(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    debugLog('Request config:', config);
    return config;
  },
  (error) => {
    devLog('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    devLog(`✅ API Response: ${response.status} ${response.config.url}`);
    debugLog('Response data:', response.data);
    return response;
  },
  (error) => {
    devLog('❌ API Response Error:', error.response?.status, error.response?.data || error.message);
    debugLog('Error details:', error);
    return Promise.reject(error);
  }
);

// GitHub API service
export const githubApi = {
  // Connect to a repository (validation)
  connectRepository: async (repoUrl) => {
    try {
      devLog('🔗 Connecting to repository:', repoUrl);
      const response = await apiClient.post('/api/github/connect', {
        repoUrl
      });
      return response.data;
    } catch (error) {
      devLog('❌ Repository connection failed:', error);
      throw error;
    }
  },

  // Analyze repository with Gemini AI
  analyzeRepository: async (repoUrl) => {
    try {
      console.log('🤖 Analyzing repository with Gemini AI:', repoUrl);
      const response = await apiClient.post('/api/github/analyze', {
        repoUrl
      });
      return response.data;
    } catch (error) {
      console.error('❌ Repository analysis failed:', error);
      throw error;
    }
  }
};

// Documentation API service
export const docsApi = {
  // Generate documentation
  generateDocs: async (repository, role, analysisData) => {
    try {
      console.log('📝 Generating documentation for:', repository.name, 'Role:', role);
      
      // Use the new working endpoint that creates pull requests
      const response = await apiClient.post('/api/generate/generate-docs', {
        repoUrl: `https://github.com/${repository.owner}/${repository.repo}`,
        role: role || 'backend'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      throw error;
    }
  },

  // Send to Mintlify
  sendToMintlify: async (repository, markdownContent, role) => {
    try {
      console.log('🚀 Sending to Mintlify:', repository.name);
      const response = await apiClient.post('/api/docs/mintlify', {
        repository,
        markdownContent,
        role
      });
      return response.data;
    } catch (error) {
      console.error('❌ Mintlify deployment failed:', error);
      throw error;
    }
  }
};

// Chat API service
export const chatApi = {
  // Create a new chat session
  createSession: async (repositoryId) => {
    try {
      const response = await apiClient.post('/api/chat/sessions', {
        repositoryId
      });
      return response.data;
    } catch (error) {
      console.error('❌ Chat session creation failed:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (sessionId, message) => {
    try {
      const response = await apiClient.post(`/api/chat/sessions/${sessionId}/messages`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('❌ Chat message failed:', error);
      throw error;
    }
  },

  // Get session history
  getSession: async (sessionId) => {
    try {
      const response = await apiClient.get(`/api/chat/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get chat session failed:', error);
      throw error;
    }
  }
};

// Roles API service
export const rolesApi = {
  // Get available roles
  getRoles: async () => {
    try {
      const response = await apiClient.get('/api/roles');
      return response.data;
    } catch (error) {
      console.error('❌ Get roles failed:', error);
      throw error;
    }
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
};

// Export the configured axios instance for custom requests
export { apiClient };
export default { githubApi, docsApi, chatApi, rolesApi, healthCheck };
