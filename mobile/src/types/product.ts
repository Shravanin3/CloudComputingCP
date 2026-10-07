export interface Product {
  id: string;
  tenantId?: string;
  categoryId?: string | null;
  name: string;
  sku?: string | null;
  sellingPrice: number;
  costPrice: number;
  price?: number;
  stock?: number;
  attributes?: any;
  isActive: boolean;
  category?: { id: string; name: string } | null;
  inventory?: { stockQuantity: number; lastRestockedDate?: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  categoryId?: string | null;
  name: string;
  sku?: string | null;
  sellingPrice: number;
  costPrice: number;
  initialStock: number;
  attributes?: any;
}
