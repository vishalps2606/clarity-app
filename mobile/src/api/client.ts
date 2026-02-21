import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP || '192.168.1.5';

const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:8080/api', 
    ios: `http://${LOCAL_IP}:8080/api`,
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

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Clearing mobile token.");
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default client;