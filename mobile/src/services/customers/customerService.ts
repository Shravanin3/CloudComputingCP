import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Customer, CustomerPaymentRequest } from '../../types/customer';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getCustomers = async (): Promise<Customer[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return GlobalStore.customers;
  }
  const response = await apiClient.get(ENDPOINTS.CUSTOMERS.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const newCustomer = { ...data, id: 'cust-' + Date.now(), creditBalance: 0 } as Customer;
    GlobalStore.customers.push(newCustomer);
    return newCustomer;
  }
  const response = await apiClient.post(ENDPOINTS.CUSTOMERS.BASE, data);
  return response.data?.data || response.data;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const idx = GlobalStore.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      GlobalStore.customers[idx] = { ...GlobalStore.customers[idx], ...data };
      return GlobalStore.customers[idx];
    }
    throw new Error('Customer not found');
  }
  const response = await apiClient.put(`${ENDPOINTS.CUSTOMERS.BASE}/${id}`, data);
  return response.data?.data || response.data;
};

export const receivePayment = async (id: string, data: CustomerPaymentRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const cust = GlobalStore.customers.find(c => c.id === id);
    if (cust) {
      cust.creditBalance = Math.max(0, (cust.creditBalance || 0) - data.amount);
      GlobalStore.dashboard.pendingCredit = Math.max(0, GlobalStore.dashboard.pendingCredit - data.amount);
      GlobalStore.dashboard.cashReceived += data.amount;
    }
    return;
  }
  await apiClient.post(`${ENDPOINTS.CUSTOMERS.BASE}/${id}/payments`, data);
};
