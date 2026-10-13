import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { Inventory, RestockRequest } from '../../types/inventory';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getInventory = async (): Promise<Inventory[]> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.getInventory();
  }
  const response = await apiClient.get(ENDPOINTS.INVENTORY.BASE);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

export const restockInventory = async (data: RestockRequest): Promise<void> => {
  const quantityToAdd = Number(data.quantityToAdd ?? data.quantity ?? 0);
  if (USE_MOCK_DATA) {
    await delay(300);
    GlobalStore.restock(data.productId, quantityToAdd);
    return;
  }
  await apiClient.post(ENDPOINTS.INVENTORY.RESTOCK, {
    productId: data.productId,
    quantityToAdd,
  });
};
