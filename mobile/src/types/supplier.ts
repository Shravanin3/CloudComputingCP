export interface Supplier { id: string; name: string; phone?: string; payableBalance?: number; }
export interface SupplierPaymentRequest { amount: number; }
// TODO: Replace with exact backend schema