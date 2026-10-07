export interface SalesReport {
  period: { startDate: string; endDate: string };
  totalSalesCount: number;
  totalRevenue: number;
  totalItemsSold: number;
  breakdownByPaymentMethod: {
    cash: number;
    upi: number;
    credit: number;
  };
}

export interface ProfitLossReport {
  period: { startDate: string; endDate: string };
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  marginPercentage: number;
}
