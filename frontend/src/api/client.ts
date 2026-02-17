import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Connect to Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Add Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login if token dies
    }
    return Promise.reject(error);
  }
);

export default api;