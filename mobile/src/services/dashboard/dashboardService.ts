import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { USE_MOCK_DATA, delay } from '../dataSource/config';
import { mockDashboard } from '../../mock/dashboard';
import { DashboardSummary } from '../../types/dashboard';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return mockDashboard;
  }
  const response = await apiClient.get(ENDPOINTS.DASHBOARD.SUMMARY);
  const data = response.data?.data || response.data;
  return data;
};
