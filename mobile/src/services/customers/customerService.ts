import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Customer, CustomerPaymentRequest } from '../../types/customer';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getCustomers = async (): Promise<Customer[]> => {
  if (USE_MOCK_DATA) {
    await delay(250);
    return GlobalStore.customers;
  }
  const response = await apiClient.get(ENDPOINTS.CUSTOMERS.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.addCustomer(data);
  }
  const response = await apiClient.post(ENDPOINTS.CUSTOMERS.BASE, data);
  return response.data?.data || response.data;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.updateCustomer(id, data);
  }
  const response = await apiClient.put(`${ENDPOINTS.CUSTOMERS.BASE}/${id}`, data);
  return response.data?.data || response.data;
};

export const receivePayment = async (id: string, data: CustomerPaymentRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    GlobalStore.receiveCustomerPayment(id, Number(data.amount) || 0);
    return;
  }
  await apiClient.post(`${ENDPOINTS.CUSTOMERS.BASE}/${id}/payments`, data);
};
