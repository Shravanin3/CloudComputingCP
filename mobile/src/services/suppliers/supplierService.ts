import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Supplier, SupplierPaymentRequest } from '../../types/supplier';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getSuppliers = async (): Promise<Supplier[]> => {
  if (USE_MOCK_DATA) { await delay(500); return GlobalStore.suppliers; }
  const response = await apiClient.get(ENDPOINTS.SUPPLIERS.BASE);
  return response.data;
};

export const createSupplier = async (data: Partial<Supplier>): Promise<Supplier> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const newSupplier = { ...data, id: 'sup-' + Date.now(), payableBalance: 0 } as Supplier;
    GlobalStore.suppliers.push(newSupplier);
    return newSupplier;
  }
  const response = await apiClient.post(ENDPOINTS.SUPPLIERS.BASE, data);
  return response.data;
};

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const idx = GlobalStore.suppliers.findIndex(s => s.id === id);
    if (idx !== -1) { GlobalStore.suppliers[idx] = { ...GlobalStore.suppliers[idx], ...data }; return GlobalStore.suppliers[idx]; }
    throw new Error('Supplier not found');
  }
  const response = await apiClient.put(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`, data);
  return response.data;
};

export const recordPayment = async (id: string, data: SupplierPaymentRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const sup = GlobalStore.suppliers.find(s => s.id === id);
    if (sup) {
      sup.payableBalance = Math.max(0, (sup.payableBalance || 0) - data.amount);
      GlobalStore.dashboard.expenses += data.amount;
    }
    return;
  }
  await apiClient.post(`${ENDPOINTS.SUPPLIERS.BASE}/${id}/payments`, data);
};
