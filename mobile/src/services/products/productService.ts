import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Product } from '../../types/product';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getProducts = async (): Promise<Product[]> => {
  if (USE_MOCK_DATA) { await delay(500); return GlobalStore.products.filter(p => p.isActive !== false); }
  const response = await apiClient.get(ENDPOINTS.PRODUCTS.BASE);
  return response.data;
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const newProduct = { ...data, id: 'prod-' + Date.now(), isActive: true } as Product;
    GlobalStore.products.push(newProduct);
    GlobalStore.inventory.push({ productId: newProduct.id, stock: 0, lowStockThreshold: 10 });
    return newProduct;
  }
  const response = await apiClient.post(ENDPOINTS.PRODUCTS.BASE, data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const idx = GlobalStore.products.findIndex(p => p.id === id);
    if (idx !== -1) { GlobalStore.products[idx] = { ...GlobalStore.products[idx], ...data }; return GlobalStore.products[idx]; }
    throw new Error('Product not found');
  }
  const response = await apiClient.put(`${ENDPOINTS.PRODUCTS.BASE}/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const idx = GlobalStore.products.findIndex(p => p.id === id);
    if (idx !== -1) { GlobalStore.products[idx].isActive = false; }
    return;
  }
  await apiClient.delete(`${ENDPOINTS.PRODUCTS.BASE}/${id}`);
};
