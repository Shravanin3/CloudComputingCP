export const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
export const formatDate = (date: string) => new Date(date).toLocaleDateString();