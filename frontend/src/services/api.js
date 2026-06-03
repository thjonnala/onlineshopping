import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use /#/login for HashRouter (GitHub Pages), fallback to /login
      window.location.href = window.location.pathname.includes('#') || window.location.hash
        ? '/#/login'
        : '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
