import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Sale, CreateSaleRequest } from '../../types/sales';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getSales = async (): Promise<Sale[]> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.sales;
  }
  const response = await apiClient.get(ENDPOINTS.SALES.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const getSaleById = async (id: string): Promise<Sale> => {
  if (USE_MOCK_DATA) {
    await delay(200);
    const s = GlobalStore.sales.find((sale) => sale.id === id);
    if (!s) throw new Error('Sale not found');
    return s;
  }
  const response = await apiClient.get(ENDPOINTS.SALES.BY_ID(id));
  return response.data?.data || response.data;
};

export const createSale = async (data: CreateSaleRequest): Promise<Sale> => {
  if (USE_MOCK_DATA) {
    await delay(400);
    return GlobalStore.createSale(data);
  }
  const response = await apiClient.post(ENDPOINTS.SALES.BASE, data);
  return response.data?.data || response.data;
};
