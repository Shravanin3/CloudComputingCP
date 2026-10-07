import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Inventory, RestockRequest } from '../../types/inventory';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { MOCK_PRODUCTS } from '../../mock/products';

// Create realistic inventory mock from products
let localInventory: Inventory[] = MOCK_PRODUCTS.map((p: any) => ({
  productId: p.id,
  stockQuantity: p.stock || 50,
  stock: p.stock || 50,
  lowStockThreshold: 10,
  product: p,
}));

export const getInventory = async (): Promise<Inventory[]> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return localInventory;
  }
  const response = await apiClient.get(ENDPOINTS.INVENTORY.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const restockInventory = async (data: RestockRequest): Promise<void> => {
  const quantityToAdd = data.quantityToAdd ?? data.quantity ?? 0;
  if (USE_MOCK_DATA) {
    await delay(500);
    const item = localInventory.find((i: any) => i.productId === data.productId);
    if (item) {
      item.stockQuantity = (item.stockQuantity || 0) + quantityToAdd;
      item.stock = item.stockQuantity;
    }
    return;
  }
  await apiClient.post(ENDPOINTS.INVENTORY.RESTOCK, {
    productId: data.productId,
    quantityToAdd,
  });
};
