import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Product } from '../../types/product';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getProducts = async (): Promise<Product[]> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.getProducts();
  }
  const response = await apiClient.get(ENDPOINTS.PRODUCTS.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.addProduct(data);
  }
  const response = await apiClient.post(ENDPOINTS.PRODUCTS.BASE, data);
  return response.data?.data || response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  console.log('[DEBUG-PRODUCT-SERVICE] 3. Service method entry updateProduct:', { id, data, USE_MOCK_DATA });
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.updateProduct(id, data);
  }
  const response = await apiClient.put(`${ENDPOINTS.PRODUCTS.BASE}/${id}`, data);
  return response.data?.data || response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    GlobalStore.deleteProduct(id);
    return;
  }
  await apiClient.delete(`${ENDPOINTS.PRODUCTS.BASE}/${id}`);
};
