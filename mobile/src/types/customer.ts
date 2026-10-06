export interface Customer { id: string; name: string; email?: string; phone?: string; outstandingBalance?: number; }
export interface CustomerPaymentRequest { amount: number; }
// TODO: Replace with exact backend schema