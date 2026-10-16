import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('educonnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
      // Clear token if invalid
      localStorage.removeItem('educonnect_token');
      localStorage.removeItem('educonnect_user');
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  }
);

export default api;
