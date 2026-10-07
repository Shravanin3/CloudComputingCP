import os
from pathlib import Path

base_dir = Path(r"d:\projects\clg sem 5\CC\cc_courseproject\mobile")

# 1. Config file
config_dir = base_dir / "src/services/dataSource"
config_dir.mkdir(parents=True, exist_ok=True)
config_dir.joinpath("config.ts").write_text("""export const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
""", encoding="utf-8")

# 2. Update productService.ts
products_service = """import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Product } from '../../types/product';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockProducts } from '../../mock/products';

let localMockProducts = [...mockProducts];

export const getProducts = async (): Promise<Product[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localMockProducts;
  }
  const response = await apiClient.get(ENDPOINTS.PRODUCTS.BASE);
  return response.data;
};
export const getProductById = async (id: string): Promise<Product> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const p = localMockProducts.find(p => p.id === id);
    if (!p) throw new Error("Product not found");
    return p;
  }
  const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_ID(id));
  return response.data;
};
export const createProduct = async (data: Omit<Product, 'id'>): Promise<Product> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const newProduct = { ...data, id: Math.random().toString() };
    localMockProducts.push(newProduct as Product);
    return newProduct as Product;
  }
  const response = await apiClient.post(ENDPOINTS.PRODUCTS.BASE, data);
  return response.data;
};
export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const index = localMockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Not found");
    localMockProducts[index] = { ...localMockProducts[index], ...data };
    return localMockProducts[index];
  }
  const response = await apiClient.put(ENDPOINTS.PRODUCTS.BY_ID(id), data);
  return response.data;
};
export const deleteProduct = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    localMockProducts = localMockProducts.filter(p => p.id !== id);
    return;
  }
  await apiClient.delete(ENDPOINTS.PRODUCTS.BY_ID(id));
};
"""
(base_dir / "src/services/products/productService.ts").write_text(products_service, encoding="utf-8")

# 3. Update inventoryService.ts
inventory_service = """import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { InventoryItem, RestockRequest } from '../../types/inventory';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockProducts } from '../../mock/products';

// Create realistic inventory mock from products
let localInventory = mockProducts.map(p => ({
  productId: p.id,
  stock: p.stock || 0,
  lowStockThreshold: 10
}));

export const getInventory = async (): Promise<InventoryItem[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localInventory;
  }
  const response = await apiClient.get(ENDPOINTS.INVENTORY.BASE);
  return response.data;
};
export const restockInventory = async (data: RestockRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const item = localInventory.find(i => i.productId === data.productId);
    if (item) item.stock += data.quantity;
    return;
  }
  await apiClient.post(ENDPOINTS.INVENTORY.RESTOCK, data);
};
"""
(base_dir / "src/services/inventory/inventoryService.ts").write_text(inventory_service, encoding="utf-8")

# 4. Update salesService.ts
sales_service = """import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Sale, CreateSaleRequest } from '../../types/sales';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockSales } from '../../mock/sales';

let localSales: Sale[] = mockSales ? [...mockSales] : [];

export const getSales = async (): Promise<Sale[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localSales;
  }
  const response = await apiClient.get(ENDPOINTS.SALES.BASE);
  return response.data;
};
export const getSaleById = async (id: string): Promise<Sale> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const s = localSales.find(s => s.id === id);
    if (!s) throw new Error("Sale not found");
    return s;
  }
  const response = await apiClient.get(ENDPOINTS.SALES.BY_ID(id));
  return response.data;
};
export const createSale = async (data: CreateSaleRequest): Promise<Sale> => {
  if (USE_MOCK_DATA) {
    await delay(800);
    const newSale: Sale = {
      id: Math.random().toString(),
      date: new Date().toISOString(),
      customerId: data.customerId,
      paymentMethod: data.paymentMethod,
      total: data.total,
      items: data.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: 0,
        subtotal: 0
      }))
    };
    localSales.push(newSale);
    return newSale;
  }
  const response = await apiClient.post(ENDPOINTS.SALES.BASE, data);
  return response.data;
};
"""
(base_dir / "src/services/sales/salesService.ts").write_text(sales_service, encoding="utf-8")

# 5. Update customerService.ts
customer_service = """import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Customer, CustomerPaymentRequest } from '../../types/customer';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockCustomers } from '../../mock/customers';

let localCustomers = [...mockCustomers];

export const getCustomers = async (): Promise<Customer[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localCustomers;
  }
  const response = await apiClient.get(ENDPOINTS.CUSTOMERS.BASE);
  return response.data;
};
export const getCustomerById = async (id: string): Promise<Customer> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const c = localCustomers.find(c => c.id === id);
    if (!c) throw new Error("Not found");
    return c;
  }
  const response = await apiClient.get(ENDPOINTS.CUSTOMERS.BY_ID(id));
  return response.data;
};
export const createCustomer = async (data: Omit<Customer, 'id'>): Promise<Customer> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const c = { ...data, id: Math.random().toString() };
    localCustomers.push(c as Customer);
    return c as Customer;
  }
  const response = await apiClient.post(ENDPOINTS.CUSTOMERS.BASE, data);
  return response.data;
};
export const receivePayment = async (id: string, data: CustomerPaymentRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const c = localCustomers.find(c => c.id === id);
    if (c && c.outstandingBalance) {
      c.outstandingBalance = Math.max(0, c.outstandingBalance - data.amount);
    }
    return;
  }
  await apiClient.post(ENDPOINTS.CUSTOMERS.PAYMENTS(id), data);
};
"""
(base_dir / "src/services/customers/customerService.ts").write_text(customer_service, encoding="utf-8")

# 6. Update supplierService.ts
supplier_service = """import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Supplier, SupplierPaymentRequest } from '../../types/supplier';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockSuppliers } from '../../mock/suppliers';

let localSuppliers = [...mockSuppliers];

export const getSuppliers = async (): Promise<Supplier[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localSuppliers;
  }
  const response = await apiClient.get(ENDPOINTS.SUPPLIERS.BASE);
  return response.data;
};
export const getSupplierById = async (id: string): Promise<Supplier> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const s = localSuppliers.find(s => s.id === id);
    if (!s) throw new Error("Not found");
    return s;
  }
  const response = await apiClient.get(ENDPOINTS.SUPPLIERS.BY_ID(id));
  return response.data;
};
export const createSupplier = async (data: Omit<Supplier, 'id'>): Promise<Supplier> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const s = { ...data, id: Math.random().toString() };
    localSuppliers.push(s as Supplier);
    return s as Supplier;
  }
  const response = await apiClient.post(ENDPOINTS.SUPPLIERS.BASE, data);
  return response.data;
};
export const sendPayment = async (id: string, data: SupplierPaymentRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const s = localSuppliers.find(s => s.id === id);
    if (s && s.payableBalance) {
      s.payableBalance = Math.max(0, s.payableBalance - data.amount);
    }
    return;
  }
  await apiClient.post(ENDPOINTS.SUPPLIERS.PAYMENTS(id), data);
};
"""
(base_dir / "src/services/suppliers/supplierService.ts").write_text(supplier_service, encoding="utf-8")

# 7. Update expenseService.ts
expense_service = """import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Expense, CreateExpenseRequest } from '../../types/expense';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockExpenses } from '../../mock/expenses';

let localExpenses = mockExpenses ? [...mockExpenses] : [];

export const getExpenses = async (): Promise<Expense[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localExpenses;
  }
  const response = await apiClient.get(ENDPOINTS.EXPENSES.BASE);
  return response.data;
};
export const createExpense = async (data: CreateExpenseRequest): Promise<Expense> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const e = { ...data, id: Math.random().toString(), date: new Date().toISOString() };
    localExpenses.push(e as Expense);
    return e as Expense;
  }
  const response = await apiClient.post(ENDPOINTS.EXPENSES.BASE, data);
  return response.data;
};
"""
(base_dir / "src/services/expenses/expenseService.ts").write_text(expense_service, encoding="utf-8")

# 8. Update dashboardService.ts and reportService.ts
(base_dir / "src/services/dashboard").mkdir(parents=True, exist_ok=True)
(base_dir / "src/services/reports").mkdir(parents=True, exist_ok=True)

dashboard_service = """import { apiClient } from '../api/apiClient';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockDashboard } from '../../mock/dashboard';

export const getDashboardSummary = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return mockDashboard;
  }
  const response = await apiClient.get('/dashboard');
  return response.data;
};
"""
(base_dir / "src/services/dashboard/dashboardService.ts").write_text(dashboard_service, encoding="utf-8")

report_service = """import { apiClient } from '../api/apiClient';
import { USE_MOCK_DATA, delay } from '../dataSource/config';

export const getSalesReport = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return { title: 'Mock Report', data: [] };
  }
  const response = await apiClient.get('/reports/sales');
  return response.data;
};
"""
(base_dir / "src/services/reports/reportService.ts").write_text(report_service, encoding="utf-8")


print("Adapter mock architecture injected successfully.")
