export interface Expense { id: string; description: string; amount: number; date: string; category?: string; }
export interface CreateExpenseRequest { description: string; amount: number; category?: string; }
// TODO: Replace with exact backend schema