import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const summary = await withTenantContext(tenantId, async (tx) => {
        // 1. Today's Sales
        const todaySales = await tx.sale.findMany({
          where: {
            tenantId,
            saleDate: { gte: startOfToday, lte: endOfToday },
          },
        });

        let todaySalesTotal = 0;
        let todayCash = 0;
        let todayUpi = 0;
        let todayCredit = 0;

        for (const s of todaySales) {
          const amt = Number(s.totalAmount);
          todaySalesTotal += amt;
          if (s.paymentMethod === 'CASH') todayCash += amt;
          if (s.paymentMethod === 'UPI') todayUpi += amt;
          if (s.paymentMethod === 'CREDIT') todayCredit += amt;
        }

        // 2. Today's Expenses
        const todayExpensesAgg = await tx.expense.aggregate({
          where: {
            tenantId,
            expenseDate: { gte: startOfToday, lte: endOfToday },
          },
          _sum: { amount: true },
        });
        const todayExpensesTotal = Number(todayExpensesAgg._sum.amount || 0);

        // 3. Low Stock Items Count (stock <= 5)
        const lowStockCount = await tx.inventory.count({
          where: {
            tenantId,
            stockQuantity: { lte: 5 },
          },
        });

        // 4. Total Pending Customer Credit (Udhaar Owed to Shop)
        const creditAgg = await tx.customer.aggregate({
          where: { tenantId },
          _sum: { creditBalance: true },
        });
        const totalPendingCredit = Number(creditAgg._sum.creditBalance || 0);

        // 5. Total Pending Supplier Payables (Debt Owed by Shop to Suppliers)
        const payableAgg = await tx.supplier.aggregate({
          where: { tenantId },
          _sum: { payableBalance: true },
        });
        const totalPendingPayables = Number(payableAgg._sum.payableBalance || 0);

        // 6. 7-Day Chart Trend Data
        const last7DaysSales = await tx.sale.findMany({
          where: {
            tenantId,
            saleDate: { gte: sevenDaysAgo },
          },
        });

        const last7DaysExpenses = await tx.expense.findMany({
          where: {
            tenantId,
            expenseDate: { gte: sevenDaysAgo },
          },
        });

        const chartMap: Record<string, { sales: number; expenses: number }> = {};

        // Initialize 7 days
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          chartMap[dateStr] = { sales: 0, expenses: 0 };
        }

        for (const s of last7DaysSales) {
          const dateStr = new Date(s.saleDate).toISOString().split('T')[0];
          if (chartMap[dateStr]) {
            chartMap[dateStr].sales += Number(s.totalAmount);
          }
        }

        for (const e of last7DaysExpenses) {
          const dateStr = new Date(e.expenseDate).toISOString().split('T')[0];
          if (chartMap[dateStr]) {
            chartMap[dateStr].expenses += Number(e.amount);
          }
        }

        const weeklyTrend = Object.keys(chartMap)
          .sort()
          .map((date) => ({
            date,
            sales: Math.round(chartMap[date].sales * 100) / 100,
            expenses: Math.round(chartMap[date].expenses * 100) / 100,
          }));

        return {
          todayMetrics: {
            totalSales: Math.round(todaySalesTotal * 100) / 100,
            cashCollected: Math.round(todayCash * 100) / 100,
            upiCollected: Math.round(todayUpi * 100) / 100,
            creditGiven: Math.round(todayCredit * 100) / 100,
            totalExpenses: Math.round(todayExpensesTotal * 100) / 100,
          },
          operationalAlerts: {
            lowStockCount,
            totalPendingCredit: Math.round(totalPendingCredit * 100) / 100,
            totalPendingPayables: Math.round(totalPendingPayables * 100) / 100,
          },
          weeklyTrend,
        };
      });

      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
}
