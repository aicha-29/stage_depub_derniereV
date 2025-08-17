// Créer une instance axios
import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Intercepteur pour les requêtes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour les réponses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;