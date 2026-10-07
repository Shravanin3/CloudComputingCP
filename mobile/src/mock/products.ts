import { Product } from '../types/product';
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', tenantId: 'tenant-1', name: 'Product A', sellingPrice: 100, costPrice: 100, isActive: true },
  { id: '2', tenantId: 'tenant-1', name: 'Product B', sellingPrice: 100, costPrice: 200, isActive: true },
];