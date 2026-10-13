import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Expense, CreateExpenseRequest } from '../../types/expense';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getExpenses = async (): Promise<Expense[]> => {
  if (USE_MOCK_DATA) {
    await delay(250);
    return GlobalStore.expenses;
  }
  const response = await apiClient.get(ENDPOINTS.EXPENSES.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const createExpense = async (data: CreateExpenseRequest): Promise<Expense> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.addExpense(data);
  }
  const response = await apiClient.post(ENDPOINTS.EXPENSES.BASE, data);
  return response.data?.data || response.data;
};
