export interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  expenseDate: string;
  date?: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: string;
  description?: string;
  expenseDate?: string;
}
