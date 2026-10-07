export interface SaleItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  product?: any;
}

export interface Sale {
  id: string;
  totalAmount: number;
  taxAmount?: number;
  paymentMethod: "CASH" | "UPI" | "CREDIT";
  saleDate: string;
  saleItems: SaleItem[];
  customer?: any;
}

export interface CreateSaleRequest {
  customerId?: string | null;
  paymentMethod: "CASH" | "UPI" | "CREDIT";
  taxAmount?: number;
  items: { productId: string; quantity: number }[];
}
