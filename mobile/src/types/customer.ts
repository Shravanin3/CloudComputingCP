export interface Customer {
  id: string;
  name: string;
  phone?: string;
  creditBalance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  creditBalance?: number;
}

export interface CustomerPaymentRequest {
  amount: number;
  paymentMethod: "CASH" | "UPI";
  notes?: string;
}
