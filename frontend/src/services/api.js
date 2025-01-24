import axios from 'axios';

const API_URL = 'https://trackerback.onrender.com/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to add auth token to requests
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
  getAll: () => api.get('/routines'),
  create: (routine) => api.post('/routines', routine),
  update: (id, updates) => api.patch(`/routines/${id}`, updates),
  delete: (id) => api.delete(`/routines/${id}`),
  toggle: (id) => api.patch(`/routines/${id}/toggle`),
  getStats: (params) => api.get('/routines/stats', { params })
};

export default api;