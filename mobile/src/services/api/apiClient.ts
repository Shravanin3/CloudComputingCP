import axios from 'axios';
import { secureStorage } from '../../utils/secureStorage';
import { triggerUnauthorized } from '../../utils/authEvents';
import { Alert } from 'react-native';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
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
