import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export interface Category {
  id: string;
  name: string;
  tenantId?: string;
  _count?: { products: number };
}

export const getCategories = async (): Promise<Category[]> => {
  if (USE_MOCK_DATA) {
    await delay(200);
    return GlobalStore.categories;
  }
  const response = await apiClient.get(ENDPOINTS.CATEGORIES.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};
