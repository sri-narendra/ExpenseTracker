import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://expensetracker-rgv6.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & 401 Path Guard
api.interceptors.response.use(
  (response) => {
    // Standardize to return response.data for success
    return response.data;
  },
  (error) => {
    // 1. Network / No Response Safety
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    }

    const { status, data } = error.response;
    const message = data?.message || 'Something went wrong';

    // 2. 401 Redirect Loop Guard
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      const basePath = currentPath.startsWith('/ExpenseTracker') ? '/ExpenseTracker' : '';
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');

      if (!isAuthPage) {
        window.location.href = `${basePath}/login`;
      }
    }

    return Promise.reject({
        status,
        message,
        success: false
    });
  }
);

export default api;
