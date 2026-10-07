import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Expense, CreateExpenseRequest } from '../../types/expense';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { MOCK_EXPENSES } from '../../mock/expenses';

let localExpenses = MOCK_EXPENSES ? [...MOCK_EXPENSES] : [];

export const getExpenses = async (): Promise<Expense[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localExpenses;
  }
  const response = await apiClient.get(ENDPOINTS.EXPENSES.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const createExpense = async (data: CreateExpenseRequest): Promise<Expense> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const e = { ...data, id: Math.random().toString(), date: new Date().toISOString() };
    localExpenses.push(e as Expense);
    return e as Expense;
  }
  const response = await apiClient.post(ENDPOINTS.EXPENSES.BASE, data);
  return response.data?.data || response.data;
};
