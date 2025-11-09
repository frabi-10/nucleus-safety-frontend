import axios from 'axios';

// Use environment variable for API URL, fallback to production backend or localhost
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://your-backend-url.com/api' : 'http://localhost:3001');

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth tokens (future use)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth_token');
          break;
        case 403:
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          console.error('Resource not found:', data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API error:', data.message || error.message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Reports API
export const reportsAPI = {
  // Get all reports
  getAll: async () => {
    const response = await apiClient.get('/api/reports');
    return response.data;
  },

  // Get single report
  getById: async (id) => {
    const response = await apiClient.get(`/api/reports/${id}`);
    return response.data;
  },

  // Create new report
  create: async (reportData) => {
    const response = await apiClient.post('/api/reports', reportData);
    return response.data;
  },

  // Update report
  update: async (id, reportData) => {
    const response = await apiClient.put(`/api/reports/${id}`, reportData);
    return response.data;
  },

  // Delete single report
  delete: async (id) => {
    const response = await apiClient.delete(`/api/reports/${id}`);
    return response.data;
  },

  // Delete all reports
  deleteAll: async () => {
    const response = await apiClient.delete('/api/reports/all');
    return response.data;
  },

  // Update report status
  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/api/reports/${id}`, { status });
    return response.data;
  },

  // Assign report
  assignReport: async (id, assignedTo, assignedBy) => {
    const response = await apiClient.put(`/api/reports/${id}`, {
      assigned_to: assignedTo,
      assigned_by: assignedBy,
    });
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  // Get comments for a report
  getByReportId: async (reportId) => {
    const response = await apiClient.get(`/api/reports/${reportId}/comments`);
    return response.data;
  },

  // Add comment to report
  create: async (reportId, commentData) => {
    const response = await apiClient.post(`/api/reports/${reportId}/comments`, commentData);
    return response.data;
  },
};

// Statistics API
export const statsAPI = {
  // Get all statistics
  getAll: async () => {
    const response = await apiClient.get('/api/stats');
    return response.data;
  },
};

// Auth API (placeholder for future implementation)
export const authAPI = {
  login: async (credentials) => {
    // TODO: Implement proper JWT auth
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    return { success: true };
  },

  validatePassword: (password) => {
    // Temporary client-side password check
    const correctPassword = import.meta.env.VITE_REPORTS_PASSWORD || 'nucleus2024';
    return password === correctPassword;
  },
};

export default apiClient;
