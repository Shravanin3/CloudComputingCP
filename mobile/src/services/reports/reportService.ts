import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';

export const getSalesReport = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.getSalesReport();
  }
  const response = await apiClient.get(ENDPOINTS.REPORTS.SALES);
  return response.data?.data || response.data;
};

export const getProfitLossReport = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(300);
    return GlobalStore.getProfitLossReport();
  }
  const response = await apiClient.get(ENDPOINTS.REPORTS.PROFIT_LOSS);
  return response.data?.data || response.data;
};
