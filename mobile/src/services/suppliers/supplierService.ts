import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Supplier, SupplierPaymentRequest } from '../../types/supplier';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getSuppliers = async (): Promise<Supplier[]> => {
  if (USE_MOCK_DATA) {
    await delay(250);
    return GlobalStore.suppliers;
  }
  const response = await apiClient.get(ENDPOINTS.SUPPLIERS.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const createSupplier = async (data: Partial<Supplier>): Promise<Supplier> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.addSupplier(data);
  }
  const response = await apiClient.post(ENDPOINTS.SUPPLIERS.BASE, data);
  return response.data?.data || response.data;
};

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.updateSupplier(id, data);
  }
  const response = await apiClient.put(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`, data);
  return response.data?.data || response.data;
};

export const recordPayment = async (id: string, data: SupplierPaymentRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    GlobalStore.recordSupplierPayment(id, Number(data.amount) || 0);
    return;
  }
  await apiClient.post(`${ENDPOINTS.SUPPLIERS.BASE}/${id}/payments`, data);
};
