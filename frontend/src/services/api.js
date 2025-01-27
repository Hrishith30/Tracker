import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://trackerback.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  forgotPassword: (email) => {
    return axios.post(`${API_URL}/auth/forgot-password`, { email });
  },
  resetPassword: (email, otp, newPassword) => {
    return axios.post(`${API_URL}/auth/reset-password`, {
      email,
      otp,
      newPassword
    });
  },
  verifyOTP: (email, otp) => {
    return axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
  }
};

// Tasks API
export const taskApi = {
  getAll: () => api.get('/tasks'),
  create: (task) => api.post('/tasks', task),
  update: (id, updates) => api.patch(`/tasks/${id}`, updates),
  delete: (id) => api.delete(`/tasks/${id}`)
};

// Expenses API
export const expenseApi = {
  getAll: () => api.get('/expenses'),
  create: (expense) => api.post('/expenses', expense),
  update: (id, updates) => api.patch(`/expenses/${id}`, updates),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: (params) => api.get('/expenses/stats', { params })
};

// Routines API
export const routineApi = {
  getAll: async (date) => {
    try {
      const response = await api.get(`/routines`, {
        params: { date }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch routines:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/routines', data);
      return response;
    } catch (error) {
      console.error('Failed to create routine:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.patch(`/routines/${id}`, data);
      return response;
    } catch (error) {
      console.error('Failed to update routine:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/routines/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to delete routine:', error);
      throw error;
    }
  },

  toggle: async (id) => {
    try {
      const response = await api.patch(`/routines/${id}/toggle`);
      return response;
    } catch (error) {
      console.error('Failed to toggle routine:', error);
      throw error;
    }
  },

  getStats: (params) => api.get('/routines/stats', { params })
};

export default api;