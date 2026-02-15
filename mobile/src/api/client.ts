import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// 1. Load from Environment
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
    console.error("❌ API URL MISSING! Create a .env file with EXPO_PUBLIC_API_URL");
}

// Create axios instance with base config
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Store token reference separately
let currentToken: string | null = null;

// Function to set token (called from LoginScreen after login)
export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

client.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default client;