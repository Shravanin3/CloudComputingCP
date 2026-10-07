export interface PurchaseItem {
  id?: string;
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface Purchase {
  id: string;
  supplierId?: string;
  isPaid: boolean;
  totalAmount: number;
  purchaseDate: string;
  items: PurchaseItem[];
  supplier?: any;
}

export interface CreatePurchaseRequest {
  supplierId?: string | null;
  isPaid: boolean;
  items: { productId: string; quantity: number; unitCost: number }[];
}
