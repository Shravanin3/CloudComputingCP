import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { User, LoginResponse } from '../../types/auth';
import { USE_MOCK_DATA, delay } from '../dataSource/config';

export const loginApi = async (email: string, password: string): Promise<{token: string, user?: User}> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      token: 'mock-jwt-token-12345',
      user: {
        id: 'mock-user-1',
        name: 'Mock User',
        email: email,
        role: 'admin',
        shopName: 'Mock MSME Retailer'
      }
    };
  }

  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
  // TODO: Adjust field names based on exact backend response
  const token = res.data.token || res.data.accessToken; 
  if (!token) throw new Error("No token returned by backend");
  return { token, user: res.data.user };
};

export const registerApi = async (data: any) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return { success: true };
  }

  const res = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  return res.data;
};

export const getCurrentUser = async (): Promise<User> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      id: 'mock-user-1',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'admin',
      shopName: 'Mock MSME Retailer'
    };
  }

  const res = await apiClient.get(ENDPOINTS.AUTH.ME);
  return res.data;
};
