export interface DailySale { date: string; amount: number; }
export interface DashboardSummary {
  totalSales: number;
  cashReceived: number;
  expenses: number;
  pendingCredit: number;
  lowStockItems: number;
  activeProducts: number;
  sevenDaySales: DailySale[];
}
