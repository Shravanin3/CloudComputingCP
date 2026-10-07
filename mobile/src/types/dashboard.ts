export interface DashboardSummary {
  todayMetrics?: {
    totalSales: number;
    cashCollected: number;
    upiCollected: number;
    creditGiven: number;
    totalExpenses: number;
  };
  operationalAlerts?: {
    lowStockCount: number;
    totalPendingCredit: number;
    totalPendingPayables: number;
  };
  weeklyTrend?: {
    date: string;
    sales: number;
    expenses: number;
  }[];
  // Backwards compatibility / convenient direct accessors
  totalSales?: number;
  cashReceived?: number;
  expenses?: number;
  pendingCredit?: number;
  lowStockItems?: number;
  activeProducts?: number;
  sevenDaySales?: {
    date: string;
    amount: number;
  }[];
}
