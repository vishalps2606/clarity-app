import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Keep this for persistence!

const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP || '192.168.1.5';

const BASE_URL = Platform.select({
    // Special IP for Android Emulator to reach PC localhost
    android: 'http://10.0.2.2:8080/api', 
    // iOS Simulator / Physical Device (Uses LAN IP)
    ios: `http://${LOCAL_IP}:8080/api`,
    // Web Browser
    web: 'http://localhost:8080/api', 
});

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

client.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('Error loading token', error);
  }
  return config;
});

// 4. Response Logger (Helpful for debugging)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the actual error message from backend if available
    const message = error.response?.data?.message || error.message;
    console.error(`API Error [${error.config?.url}]:`, message);
    return Promise.reject(error);
  }
);

export default client;