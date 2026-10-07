import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { User, Tenant, LoginResponse, MeResponse } from '../../types/auth';
import { USE_MOCK_DATA, delay } from '../dataSource/config';

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      token: 'mock-jwt-token-12345',
      user: {
        id: 'mock-user-1',
        name: 'Mock User',
        email: email,
        role: 'admin',
      },
      tenant: {
        id: 'mock-tenant-1',
        shopName: 'Mock MSME Retailer',
      },
    };
  }

  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
  const data = res.data?.data || res.data;
  const token = data.token || data.accessToken;
  if (!token) throw new Error('No token returned by backend');
  return {
    token,
    user: data.user,
    tenant: data.tenant,
  };
};

export const registerApi = async (data: any) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return { success: true };
  }

  const res = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  return res.data?.data || res.data;
};

export const getCurrentUser = async (): Promise<MeResponse> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      user: {
        id: 'mock-user-1',
        name: 'Mock User',
        email: 'mock@example.com',
        role: 'admin',
      },
      tenant: {
        id: 'mock-tenant-1',
        shopName: 'Mock MSME Retailer',
      },
    };
  }

  const res = await apiClient.get(ENDPOINTS.AUTH.ME);
  return res.data?.data || res.data;
};
