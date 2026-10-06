
import { MOCK_PRODUCTS } from './products';
import { MOCK_CUSTOMERS } from './customers';
import { MOCK_SUPPLIERS } from './suppliers';
import { MOCK_SALES } from './sales';
import { MOCK_EXPENSES } from './expenses';
import { mockDashboard } from './dashboard';

export const GlobalStore = {
  products: [...MOCK_PRODUCTS],
  customers: [...MOCK_CUSTOMERS],
  suppliers: [...MOCK_SUPPLIERS],
  sales: MOCK_SALES ? [...MOCK_SALES] : [],
  expenses: MOCK_EXPENSES ? [...MOCK_EXPENSES] : [],
  dashboard: { ...mockDashboard },
  inventory: MOCK_PRODUCTS.map((p: any) => ({
    productId: p.id,
    stock: p.stock || 0,
    lowStockThreshold: 10
  }))
};
