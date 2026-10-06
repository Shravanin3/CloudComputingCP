export interface InventoryItem { productId: string; stock: number; lowStockThreshold: number; }
export interface RestockRequest { productId: string; quantity: number; }
// TODO: Replace with exact backend schema