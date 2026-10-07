import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/catalog/category.routes';
import productRoutes from './modules/catalog/product.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import customerRoutes from './modules/customers/customers.routes';
import supplierRoutes from './modules/suppliers/suppliers.routes';
import saleRoutes from './modules/sales/sales.routes';
import purchaseRoutes from './modules/purchases/purchases.routes';
import expenseRoutes from './modules/expenses/expenses.routes';
import ledgerRoutes from './modules/ledger/ledger.routes';
import reportRoutes from './modules/reports/reports.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

export const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// Health Check Probe (Required for Azure Container Apps & Docker)
// -------------------------------------------------------------
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'msme-fintech-backend',
    version: '1.0.0',
  });
});

// -------------------------------------------------------------
// Core API Routing (Prefix: /api/v1)
// -------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/ledger', ledgerRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

