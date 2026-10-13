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
  cashTendered?: number | null;
  changeReturned?: number | null;
  upiId?: string | null;
  upiRef?: string | null;
  notes?: string | null;
  saleDate: string;
  saleItems: SaleItem[];
  customer?: any;
}

export interface CreateSaleRequest {
  customerId?: string | null;
  paymentMethod: "CASH" | "UPI" | "CREDIT";
  taxAmount?: number;
  cashTendered?: number | null;
  changeReturned?: number | null;
  upiId?: string | null;
  upiRef?: string | null;
  notes?: string | null;
  items: { productId: string; quantity: number }[];
}
