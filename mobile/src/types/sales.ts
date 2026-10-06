export interface SaleItem { productId: string; quantity: number; unitPrice: number; subtotal: number; }
export interface Sale { id: string; customerId?: string; items: SaleItem[]; total: number; paymentMethod: string; date: string; }
export interface CreateSaleRequest { customerId?: string; items: {productId: string; quantity: number}[]; paymentMethod: string; total: number; }
// TODO: Replace with exact backend schema