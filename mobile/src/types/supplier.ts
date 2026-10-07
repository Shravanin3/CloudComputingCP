export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  payableBalance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierRequest {
  name: string;
  phone?: string;
  payableBalance?: number;
}

export interface SupplierPaymentRequest {
  amount: number;
  paymentMethod: "CASH" | "UPI";
  notes?: string;
}
