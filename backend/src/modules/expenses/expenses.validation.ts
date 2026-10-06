import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.number().positive('Expense amount must be greater than zero'),
  category: z.string().min(1, 'Category is required (e.g. Rent, Electricity, Salaries, Transport)'),
  description: z.string().optional(),
  expenseDate: z.string().optional(),
});
