import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { secureStorage } from '../../utils/secureStorage';
import { triggerUnauthorized } from '../../utils/authEvents';

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  // Web browsers: access via current host or localhost:5000
  if (Platform.OS === 'web') {
    const webHost = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
    return `http://${webHost}:5000/api/v1`;
  }

  // If envUrl is explicitly configured with a tunnel or external IP, use it directly
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Physical devices in Expo Go: extract Metro host IP if it is a valid LAN IPv4
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostIp);
    if (isIpv4 && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000/api/v1`;
    }
  }

  // Active HTTPS Cloud Tunnel (verified live, bypasses Windows Firewall block)
  return 'https://a7bf21c9fac2e7.lhr.life/api/v1';
};

export const API_BASE_URL = getBaseUrl();
console.log(`[API Base URL]: ${API_BASE_URL} (Platform: ${Platform.OS})`);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  if (config.headers) {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
  }
  const token = await secureStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your internet connection.';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || error.response.data?.error;
      
      switch (status) {
        case 401:
          errorMessage = 'Session expired. Please log in again.';
          triggerUnauthorized(); // Global logout trigger
          break;
        case 403:
          errorMessage = 'Unauthorized: You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 409:
          errorMessage = serverMessage || 'Conflict error.';
          break;
        case 422:
          errorMessage = serverMessage || 'Validation error. Please check your inputs.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = serverMessage || `Error ${status}: Something went wrong.`;
      }
    }

    // Attach user-friendly message to the error object so components can display it
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);
