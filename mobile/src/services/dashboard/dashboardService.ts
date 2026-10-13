import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { GlobalStore } from '../../mock/store';
import { DashboardSummary } from '../../types/dashboard';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  if (USE_MOCK_DATA) {
    await delay(250);
    return GlobalStore.getDashboardSummary();
  }
  const response = await apiClient.get(ENDPOINTS.DASHBOARD.SUMMARY);
  const data = response.data?.data || response.data;
  return data;
};
