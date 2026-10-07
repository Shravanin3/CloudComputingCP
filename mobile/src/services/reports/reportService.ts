import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { USE_MOCK_DATA, delay } from '../dataSource/config';

export const getSalesReport = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      totalSales: 50000,
      numberOfSales: 120,
      salesTrend: '+10%',
    };
  }
  const response = await apiClient.get(ENDPOINTS.REPORTS.SALES);
  return response.data?.data || response.data;
};

export const getProfitLossReport = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      revenue: 50000,
      cogs: 20000,
      grossProfit: 30000,
      expenses: 10000,
      netProfit: 20000,
    };
  }
  const response = await apiClient.get(ENDPOINTS.REPORTS.PROFIT_LOSS);
  return response.data?.data || response.data;
};
