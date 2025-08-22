// frontend/src/api/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, newPassword: password }),
};

// Menu APIs
export const menuAPI = {
  getAll: (filters = {}) => api.get('/menu', { params: filters }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/menu/${id}/availability`),
  updateQuantity: (id, data) => api.patch(`/menu/${id}/quantity`, data),
  getCategories: () => api.get('/menu/categories'),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getUserOrders: (params = {}) => api.get('/orders/my-orders', { params }),
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  updatePayment: (id, paymentStatus) => api.patch(`/orders/${id}/payment`, { paymentStatus }),
  addFeedback: (id, feedback) => api.post(`/orders/${id}/feedback`, feedback),
  getAnalytics: (params = {}) => api.get('/orders/analytics', { params }),
};

// Inventory APIs
export const inventoryAPI = {
  getAll: (filters = {}) => api.get('/inventory', { params: filters }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  updateStock: (id, data) => api.patch(`/inventory/${id}/stock`, data),
  addWastage: (id, data) => api.post(`/inventory/${id}/wastage`, data),
  getLowStock: () => api.get('/inventory/low-stock'),
  getWastageReport: (params = {}) => api.get('/inventory/wastage-report', { params }),
  getCategories: () => api.get('/inventory/categories'),
};

// User APIs
export const userAPI = {
  getAll: (filters = {}) => api.get('/users', { params: filters }),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};

export default api;