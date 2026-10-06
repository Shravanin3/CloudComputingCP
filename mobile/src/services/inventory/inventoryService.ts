import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { InventoryItem, RestockRequest } from '../../types/inventory';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { MOCK_PRODUCTS } from '../../mock/products';

// Create realistic inventory mock from products
let localInventory = MOCK_PRODUCTS.map((p: any) => ({
  productId: p.id,
  stock: p.stock || 0,
  lowStockThreshold: 10
}));

export const getInventory = async (): Promise<InventoryItem[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localInventory;
  }
  const response = await apiClient.get(ENDPOINTS.INVENTORY.BASE);
  return response.data;
};
export const restockInventory = async (data: RestockRequest): Promise<void> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const item = localInventory.find((i: any) => i.productId === data.productId);
    if (item) item.stock += data.quantity;
    return;
  }
  await apiClient.post(ENDPOINTS.INVENTORY.RESTOCK, data);
};
