import { Product } from './product';

export interface Inventory {
  productId: string;
  stockQuantity: number;
  stock?: number;
  lowStockThreshold?: number;
  lastRestockedDate?: string;
  product?: Product;
}

export interface RestockRequest {
  productId: string;
  quantityToAdd?: number;
  quantity?: number;
}
