export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  INVENTORY: {
    BASE: '/inventory',
    RESTOCK: '/inventory/restock',
  },
  SALES: {
    BASE: '/sales',
    BY_ID: (id: string) => `/sales/${id}`,
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
    PAYMENTS: (id: string) => `/customers/${id}/payments`,
  },
  SUPPLIERS: {
    BASE: '/suppliers',
    BY_ID: (id: string) => `/suppliers/${id}`,
    PAYMENTS: (id: string) => `/suppliers/${id}/payments`,
  },
  EXPENSES: {
    BASE: '/expenses',
    BY_ID: (id: string) => `/expenses/${id}`,
  },
  DASHBOARD: { SUMMARY: '/dashboard/summary' },
  REPORTS: { SALES: '/reports/sales', PROFIT_LOSS: '/reports/profit-loss' },
};
