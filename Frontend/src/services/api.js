import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens etc.
api.interceptors.request.use(
  (config) => {
    // Add any request preprocessing here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.request);
      return Promise.reject({ data: { error: 'Network error - server unreachable' } });
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
      return Promise.reject({ data: { error: 'Request failed' } });
    }
  }
);

export default {
  // Generate new UI
  generate: (userIntent) => {
    return api.post('/generate', { userIntent });
  },

  // Iterate on existing UI
  iterate: (versionId, modificationIntent) => {
    return api.post('/iterate', { versionId, modificationIntent });
  },

  // Rollback to specific version
  rollback: (versionId) => {
    return api.post('/rollback', { versionId });
  },

  // Get version history
  getHistory: (limit = 50, page = 1) => {
    return api.get('/history', { params: { limit, page } });
  },

  // Get single version
  getVersion: (versionId) => {
    return api.get(`/history/${versionId}`);
  }
};

