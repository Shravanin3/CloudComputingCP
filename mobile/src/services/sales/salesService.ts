import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Sale, CreateSaleRequest } from '../../types/sales';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { MOCK_SALES } from '../../mock/sales';

let localSales: Sale[] = MOCK_SALES ? [...MOCK_SALES] : [];

export const getSales = async (): Promise<Sale[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localSales;
  }
  const response = await apiClient.get(ENDPOINTS.SALES.BASE);
  return response.data;
};
export const getSaleById = async (id: string): Promise<Sale> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const s = localSales.find(s => s.id === id);
    if (!s) throw new Error("Sale not found");
    return s;
  }
  const response = await apiClient.get(ENDPOINTS.SALES.BY_ID(id));
  return response.data;
};
export const createSale = async (data: CreateSaleRequest): Promise<Sale> => {
  if (USE_MOCK_DATA) {
    await delay(800);
    const newSale: Sale = {
      id: Math.random().toString(),
      date: new Date().toISOString(),
      customerId: data.customerId,
      paymentMethod: data.paymentMethod,
      total: data.total,
      items: data.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: 0,
        subtotal: 0
      }))
    };
    localSales.push(newSale);
    return newSale;
  }
  const response = await apiClient.post(ENDPOINTS.SALES.BASE, data);
  return response.data;
};
