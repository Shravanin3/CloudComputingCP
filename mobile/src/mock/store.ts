import { Product } from '../types/product';
import { Customer } from '../types/customer';
import { Supplier } from '../types/supplier';
import { Sale, SaleItem, CreateSaleRequest } from '../types/sales';
import { Expense, CreateExpenseRequest } from '../types/expense';
import { Inventory, RestockRequest } from '../types/inventory';
import { Category } from '../services/categories/categoryService';
import { DashboardSummary } from '../types/dashboard';

// ---------------------------------------------------------------------
// INITIAL MOCK DATASETS (Realistic Indian MSME Kirana Retail Store)
// ---------------------------------------------------------------------

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'General' },
  { id: 'cat-2', name: 'Grains & Pulses' },
  { id: 'cat-3', name: 'Cooking Oils & Ghee' },
  { id: 'cat-4', name: 'Dairy & Eggs' },
  { id: 'cat-5', name: 'Snacks & Biscuits' },
  { id: 'cat-6', name: 'Tea & Coffee' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Parle-G Glucose Biscuit 250g',
    sku: 'PG-250',
    categoryId: 'cat-5',
    category: { id: 'cat-5', name: 'Snacks & Biscuits' },
    sellingPrice: 25,
    costPrice: 20,
    stock: 60,
    isActive: true,
    inventory: { stockQuantity: 60, lastRestockedDate: new Date().toISOString() },
  },
  {
    id: 'prod-2',
    name: 'Tata Salt Vacuum Evaporated 1kg',
    sku: 'TS-1KG',
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Grains & Pulses' },
    sellingPrice: 28,
    costPrice: 22,
    stock: 45,
    isActive: true,
    inventory: { stockQuantity: 45, lastRestockedDate: new Date().toISOString() },
  },
  {
    id: 'prod-3',
    name: 'Fortune Sunlite Sunflower Oil 1L',
    sku: 'FO-1L',
    categoryId: 'cat-3',
    category: { id: 'cat-3', name: 'Cooking Oils & Ghee' },
    sellingPrice: 150,
    costPrice: 125,
    stock: 25,
    isActive: true,
    inventory: { stockQuantity: 25, lastRestockedDate: new Date().toISOString() },
  },
  {
    id: 'prod-4',
    name: 'Amul Taaza Toned Milk 500ml',
    sku: 'AM-500',
    categoryId: 'cat-4',
    category: { id: 'cat-4', name: 'Dairy & Eggs' },
    sellingPrice: 27,
    costPrice: 24,
    stock: 8, // Low stock item (< 10) for realistic dashboard alert
    isActive: true,
    inventory: { stockQuantity: 8, lastRestockedDate: new Date().toISOString() },
  },
  {
    id: 'prod-5',
    name: 'Brooke Bond Red Label Tea 250g',
    sku: 'RL-250',
    categoryId: 'cat-6',
    category: { id: 'cat-6', name: 'Tea & Coffee' },
    sellingPrice: 135,
    costPrice: 110,
    stock: 30,
    isActive: true,
    inventory: { stockQuantity: 30, lastRestockedDate: new Date().toISOString() },
  },
  {
    id: 'prod-6',
    name: 'Aashirvaad Superior MP Atta 5kg',
    sku: 'AA-5KG',
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Grains & Pulses' },
    sellingPrice: 245,
    costPrice: 210,
    stock: 18,
    isActive: true,
    inventory: { stockQuantity: 18, lastRestockedDate: new Date().toISOString() },
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ramesh Patil',
    phone: '9822012345',
    creditBalance: 1250,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Sunita Sharma',
    phone: '9822054321',
    creditBalance: 450,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Amit Kulkarni',
    phone: '9890123456',
    creditBalance: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Pune Wholesale FMCG Distributors',
    phone: '9850112233',
    payableBalance: 14500,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'sup-2',
    name: 'Mahalaxmi Dairy Products',
    phone: '9850334455',
    payableBalance: 3200,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'sup-3',
    name: 'Balaji Oil & Provisions Wholesalers',
    phone: '9850556677',
    payableBalance: 0,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    totalAmount: 300,
    paymentMethod: 'CASH',
    saleDate: new Date(Date.now() - 3 * 3600000).toISOString(),
    customer: null,
    saleItems: [
      {
        id: 'si-1',
        productId: 'prod-1',
        quantity: 4,
        unitPrice: 25,
        lineTotal: 100,
        product: { id: 'prod-1', name: 'Parle-G Glucose Biscuit 250g' },
      },
      {
        id: 'si-2',
        productId: 'prod-3',
        quantity: 1,
        unitPrice: 150,
        lineTotal: 150,
        product: { id: 'prod-3', name: 'Fortune Sunlite Sunflower Oil 1L' },
      },
      {
        id: 'si-3',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 25,
        lineTotal: 50,
        product: { id: 'prod-1', name: 'Parle-G Glucose Biscuit 250g' },
      },
    ],
  },
  {
    id: 'sale-2',
    totalAmount: 380,
    paymentMethod: 'UPI',
    saleDate: new Date(Date.now() - 6 * 3600000).toISOString(),
    customer: null,
    saleItems: [
      {
        id: 'si-4',
        productId: 'prod-5',
        quantity: 2,
        unitPrice: 135,
        lineTotal: 270,
        product: { id: 'prod-5', name: 'Brooke Bond Red Label Tea 250g' },
      },
      {
        id: 'si-5',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 28,
        lineTotal: 56,
        product: { id: 'prod-2', name: 'Tata Salt Vacuum Evaporated 1kg' },
      },
      {
        id: 'si-6',
        productId: 'prod-4',
        quantity: 2,
        unitPrice: 27,
        lineTotal: 54,
        product: { id: 'prod-4', name: 'Amul Taaza Toned Milk 500ml' },
      },
    ],
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    amount: 15000,
    category: 'Rent',
    description: 'Monthly Shop Rent',
    expenseDate: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'exp-2',
    amount: 2850,
    category: 'Electricity',
    description: 'MSEB Commercial Meter',
    expenseDate: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'exp-3',
    amount: 600,
    category: 'Tea & Snacks',
    description: 'Shop refreshment expense',
    expenseDate: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// ---------------------------------------------------------------------
// UNIFIED MUTABLE GLOBAL STORE
// ---------------------------------------------------------------------

export const GlobalStore = {
  categories: [...INITIAL_CATEGORIES],
  products: [...INITIAL_PRODUCTS],
  customers: [...INITIAL_CUSTOMERS],
  suppliers: [...INITIAL_SUPPLIERS],
  sales: [...INITIAL_SALES],
  expenses: [...INITIAL_EXPENSES],
  inventory: INITIAL_PRODUCTS.map((p) => ({
    productId: p.id,
    stockQuantity: p.stock ?? 0,
    stock: p.stock ?? 0,
    lowStockThreshold: 10,
    lastRestockedDate: new Date().toISOString(),
    product: p,
  })),

  // -------------------------------------------------------------------
  // PRODUCT & CATEGORY OPERATIONS
  // -------------------------------------------------------------------
  getProducts(): Product[] {
    return this.products
      .filter((p) => p.isActive !== false)
      .map((p) => ({
        ...p,
        inventory: {
          stockQuantity: p.stock ?? 0,
          lastRestockedDate: p.inventory?.lastRestockedDate || new Date().toISOString(),
        },
      }));
  },

  addProduct(data: Partial<Product>): Product {
    const id = 'prod-' + Date.now();
    const stock = Number((data as any).initialStock ?? data.stock ?? 0);
    const sellingPrice = Number(data.sellingPrice || 0);
    const costPrice = Number(data.costPrice ?? Math.round(sellingPrice * 0.8));

    // Resolve Category
    let category = data.category;
    if (data.categoryId && !category) {
      const match = this.categories.find((c) => c.id === data.categoryId);
      if (match) {
        category = { id: match.id, name: match.name };
      }
    }
    if (!category && (data as any).category && typeof (data as any).category === 'string') {
      const catName = (data as any).category.trim();
      let match = this.categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
      if (!match) {
        match = { id: 'cat-' + Date.now(), name: catName };
        this.categories.push(match);
      }
      category = { id: match.id, name: match.name };
    }
    if (!category) {
      category = { id: 'cat-1', name: 'General' };
    }

    const newProduct: Product = {
      id,
      name: data.name || 'Unnamed Product',
      sku: data.sku || undefined,
      categoryId: category.id,
      category,
      sellingPrice,
      costPrice,
      price: sellingPrice,
      stock,
      isActive: true,
      inventory: {
        stockQuantity: stock,
        lastRestockedDate: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    this.syncInventory();
    return newProduct;
  },

  updateProduct(id: string, data: Partial<Product>): Product {
    console.log('[DEBUG-STORE] 4a. Mock-store mutation BEFORE:', {
      id,
      existing: this.products.find((p) => p.id === id),
      incomingData: data,
    });

    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const existing = this.products[idx];
    let category = existing.category;
    if (data.categoryId) {
      const match = this.categories.find((c) => c.id === data.categoryId);
      if (match) {
        category = { id: match.id, name: match.name };
      }
    } else if ((data as any).category && typeof (data as any).category === 'string') {
      const catName = (data as any).category.trim();
      let match = this.categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
      if (!match) {
        match = { id: 'cat-' + Date.now(), name: catName };
        this.categories.push(match);
      }
      category = { id: match.id, name: match.name };
    }

    const updatedSellingPrice = data.sellingPrice !== undefined ? Number(data.sellingPrice) : (existing.sellingPrice ?? existing.price ?? 0);
    const updated: Product = {
      ...existing,
      ...data,
      category,
      sellingPrice: updatedSellingPrice,
      price: updatedSellingPrice,
      updatedAt: new Date().toISOString(),
    };

    this.products[idx] = updated;
    this.syncInventory();

    console.log('[DEBUG-STORE] 4b. Mock-store mutation AFTER:', {
      id,
      updatedProduct: this.products[idx],
    });

    return updated;
  },

  deleteProduct(id: string): void {
    const p = this.products.find((prod) => prod.id === id);
    if (p) {
      p.isActive = false;
      this.syncInventory();
    }
  },

  // -------------------------------------------------------------------
  // INVENTORY OPERATIONS
  // -------------------------------------------------------------------
  syncInventory() {
    this.inventory = this.products
      .filter((p) => p.isActive !== false)
      .map((p) => ({
        productId: p.id,
        stockQuantity: p.stock ?? 0,
        stock: p.stock ?? 0,
        lowStockThreshold: 10,
        lastRestockedDate: p.inventory?.lastRestockedDate || new Date().toISOString(),
        product: p,
      }));
  },

  getInventory(): Inventory[] {
    this.syncInventory();
    return this.inventory;
  },

  restock(productId: string, quantity: number): void {
    const product = this.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found in catalog');

    const currentStock = product.stock ?? 0;
    const newStock = currentStock + quantity;
    product.stock = newStock;
    product.inventory = {
      stockQuantity: newStock,
      lastRestockedDate: new Date().toISOString(),
    };

    this.syncInventory();
  },

  // -------------------------------------------------------------------
  // POS & SALES OPERATIONS
  // -------------------------------------------------------------------
  createSale(data: CreateSaleRequest): Sale {
    let totalAmount = 0;
    const saleItems: SaleItem[] = [];

    for (const item of data.items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const availableStock = product.stock ?? 0;
      if (item.quantity > availableStock) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${availableStock}`);
      }

      const unitPrice = Number(product.sellingPrice) || 0;
      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      // Decrement product inventory
      product.stock = Math.max(0, availableStock - item.quantity);
      product.inventory = {
        stockQuantity: product.stock,
        lastRestockedDate: product.inventory?.lastRestockedDate || new Date().toISOString(),
      };

      saleItems.push({
        id: 'si-' + Date.now() + '-' + Math.random().toString().slice(2, 6),
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
        },
      });
    }

    // Resolve Customer
    let customer: any = null;
    if (data.customerId) {
      const cust = this.customers.find((c) => c.id === data.customerId);
      if (cust) {
        customer = { id: cust.id, name: cust.name, phone: cust.phone };
        // If CREDIT sale, increase customer credit dues
        if (data.paymentMethod === 'CREDIT') {
          cust.creditBalance = (Number(cust.creditBalance) || 0) + totalAmount;
        }
      }
    }

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      totalAmount,
      taxAmount: data.taxAmount || 0,
      paymentMethod: data.paymentMethod,
      cashTendered: data.cashTendered != null ? Number(data.cashTendered) : null,
      changeReturned: data.changeReturned != null ? Number(data.changeReturned) : null,
      upiId: data.upiId || null,
      upiRef: data.upiRef || null,
      notes: data.notes || null,
      saleDate: new Date().toISOString(),
      saleItems,
      customer,
    };

    this.sales.unshift(newSale);
    this.syncInventory();
    return newSale;
  },

  // -------------------------------------------------------------------
  // CUSTOMER OPERATIONS
  // -------------------------------------------------------------------
  addCustomer(data: Partial<Customer>): Customer {
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: data.name || 'Unnamed Customer',
      phone: data.phone || undefined,
      creditBalance: Number(data.creditBalance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.customers.unshift(newCust);
    return newCust;
  },

  updateCustomer(id: string, data: Partial<Customer>): Customer {
    const idx = this.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    this.customers[idx] = {
      ...this.customers[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.customers[idx];
  },

  receiveCustomerPayment(id: string, amount: number): void {
    const cust = this.customers.find((c) => c.id === id);
    if (!cust) throw new Error('Customer not found');

    cust.creditBalance = Math.max(0, (Number(cust.creditBalance) || 0) - amount);
    cust.updatedAt = new Date().toISOString();
  },

  // -------------------------------------------------------------------
  // SUPPLIER OPERATIONS
  // -------------------------------------------------------------------
  addSupplier(data: Partial<Supplier>): Supplier {
    const newSup: Supplier = {
      id: 'sup-' + Date.now(),
      name: data.name || 'Unnamed Supplier',
      phone: data.phone || undefined,
      payableBalance: Number(data.payableBalance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.suppliers.unshift(newSup);
    return newSup;
  },

  updateSupplier(id: string, data: Partial<Supplier>): Supplier {
    const idx = this.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Supplier not found');
    this.suppliers[idx] = {
      ...this.suppliers[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.suppliers[idx];
  },

  recordSupplierPayment(id: string, amount: number): void {
    const sup = this.suppliers.find((s) => s.id === id);
    if (!sup) throw new Error('Supplier not found');

    sup.payableBalance = Math.max(0, (Number(sup.payableBalance) || 0) - amount);
    sup.updatedAt = new Date().toISOString();

    // Log corresponding business expense for the payment
    this.addExpense({
      amount,
      category: 'Supplier Payment',
      description: `Payment to ${sup.name}`,
    });
  },

  // -------------------------------------------------------------------
  // EXPENSE OPERATIONS
  // -------------------------------------------------------------------
  addExpense(data: CreateExpenseRequest): Expense {
    const newExp: Expense = {
      id: 'exp-' + Date.now(),
      amount: Number(data.amount) || 0,
      category: data.category || 'Other',
      description: data.description || undefined,
      expenseDate: data.expenseDate || new Date().toISOString(),
      date: data.expenseDate || new Date().toISOString(),
    };
    this.expenses.unshift(newExp);
    return newExp;
  },

  // -------------------------------------------------------------------
  // DYNAMIC DASHBOARD SUMMARY
  // -------------------------------------------------------------------
  getDashboardSummary(): DashboardSummary {
    const activeProds = this.products.filter((p) => p.isActive !== false);
    const lowStockCount = activeProds.filter((p) => (p.stock ?? 0) <= 10).length;

    let totalSales = 0;
    let cashCollected = 0;
    let upiCollected = 0;
    let creditGiven = 0;

    for (const s of this.sales) {
      const amt = Number(s.totalAmount) || 0;
      totalSales += amt;
      if (s.paymentMethod === 'CASH') cashCollected += amt;
      else if (s.paymentMethod === 'UPI') upiCollected += amt;
      else if (s.paymentMethod === 'CREDIT') creditGiven += amt;
    }

    const totalExpenses = this.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalPendingCredit = this.customers.reduce(
      (sum, c) => sum + (Number(c.creditBalance) || 0),
      0
    );
    const totalPendingPayables = this.suppliers.reduce(
      (sum, s) => sum + (Number(s.payableBalance) || 0),
      0
    );

    // Dynamic 7-day trend calculation
    const sevenDaySales = [
      { date: 'Mon', amount: Math.round(totalSales * 0.1) },
      { date: 'Tue', amount: Math.round(totalSales * 0.12) },
      { date: 'Wed', amount: Math.round(totalSales * 0.15) },
      { date: 'Thu', amount: Math.round(totalSales * 0.14) },
      { date: 'Fri', amount: Math.round(totalSales * 0.18) },
      { date: 'Sat', amount: Math.round(totalSales * 0.2) },
      { date: 'Sun', amount: Math.round(totalSales * 0.11) },
    ];

    return {
      todayMetrics: {
        totalSales,
        cashCollected: cashCollected + upiCollected,
        upiCollected,
        creditGiven,
        totalExpenses,
      },
      operationalAlerts: {
        lowStockCount,
        totalPendingCredit,
        totalPendingPayables,
      },
      weeklyTrend: sevenDaySales.map((d) => ({
        date: d.date,
        sales: d.amount,
        expenses: Math.round(totalExpenses / 7),
      })),
      totalSales,
      cashReceived: cashCollected + upiCollected,
      expenses: totalExpenses,
      pendingCredit: totalPendingCredit,
      lowStockItems: lowStockCount,
      activeProducts: activeProds.length,
      sevenDaySales,
    };
  },

  // -------------------------------------------------------------------
  // DYNAMIC REPORTS
  // -------------------------------------------------------------------
  getSalesReport(): any {
    let cash = 0;
    let upi = 0;
    let credit = 0;
    let totalRevenue = 0;

    const trendMap: Record<string, { sales: number; count: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = { sales: 0, count: 0 };
    }

    for (const s of this.sales) {
      const amt = Number(s.totalAmount) || 0;
      totalRevenue += amt;
      if (s.paymentMethod === 'CASH') cash += amt;
      else if (s.paymentMethod === 'UPI') upi += amt;
      else if (s.paymentMethod === 'CREDIT') credit += amt;

      const dStr = s.saleDate ? new Date(s.saleDate).toISOString().split('T')[0] : '';
      if (trendMap[dStr]) {
        trendMap[dStr].sales += amt;
        trendMap[dStr].count += 1;
      }
    }

    const dailyTrend = Object.keys(trendMap)
      .sort()
      .map((date) => ({
        date,
        sales: Math.round(trendMap[date].sales * 100) / 100,
        count: trendMap[date].count,
      }));

    return {
      totalSales: totalRevenue,
      totalRevenue,
      numberOfSales: this.sales.length,
      salesTrend: '+12.5%',
      breakdownByPaymentMethod: {
        cash,
        upi,
        credit,
      },
      dailyTrend,
      recentSales: this.sales.slice(0, 10),
    };
  },

  getProfitLossReport(): any {
    let revenue = 0;
    let cogs = 0;

    for (const s of this.sales) {
      revenue += Number(s.totalAmount) || 0;
      if (s.saleItems) {
        for (const item of s.saleItems) {
          const cost = Number(item.product?.costPrice || 0) || Math.round((item.unitPrice || 0) * 0.8);
          cogs += cost * (item.quantity || 1);
        }
      }
    }

    const grossProfit = Math.max(0, revenue - cogs);
    const totalExpenses = this.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = grossProfit - totalExpenses;
    const marginPercentage = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';

    const expMap: Record<string, number> = {};
    for (const e of this.expenses) {
      const cat = e.category || 'Other';
      expMap[cat] = (expMap[cat] || 0) + (Number(e.amount) || 0);
    }
    const categoryBreakdown = Object.keys(expMap).map((category) => ({
      category,
      amount: expMap[category],
    }));

    return {
      revenue,
      costOfGoodsSold: cogs,
      cogs,
      grossProfit,
      totalExpenses,
      expenses: totalExpenses,
      netProfit,
      marginPercentage,
      categoryBreakdown,
    };
  },
};
