import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';

export class ReportsController {
  static async getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const report = await withTenantContext(tenantId, async (tx) => {
        const sales = await tx.sale.findMany({
          where: {
            tenantId,
            saleDate: { gte: startDate, lte: endDate },
          },
          include: { saleItems: true },
          orderBy: { saleDate: 'asc' },
        });

        let totalRevenue = 0;
        let totalItemsSold = 0;
        let cashSales = 0;
        let upiSales = 0;
        let creditSales = 0;

        // Daily trend mapping for charts (last 7 days)
        const trendMap: Record<string, { sales: number; count: number }> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          trendMap[dateStr] = { sales: 0, count: 0 };
        }

        for (const s of sales) {
          const amt = Number(s.totalAmount);
          totalRevenue += amt;
          if (s.paymentMethod === 'CASH') cashSales += amt;
          if (s.paymentMethod === 'UPI') upiSales += amt;
          if (s.paymentMethod === 'CREDIT') creditSales += amt;

          for (const item of s.saleItems) {
            totalItemsSold += item.quantity;
          }

          const dStr = new Date(s.saleDate).toISOString().split('T')[0];
          if (trendMap[dStr]) {
            trendMap[dStr].sales += amt;
            trendMap[dStr].count += 1;
          }
        }

        const dailyTrend = Object.keys(trendMap)
          .sort()
          .map((date) => ({
            date,
            sales: Math.round(trendMap[date].sales * 100) / 100,
            count: trendMap[date].count,
          }));

        return {
          period: { startDate, endDate },
          totalSalesCount: sales.length,
          totalRevenue,
          totalItemsSold,
          breakdownByPaymentMethod: {
            cash: cashSales,
            upi: upiSales,
            credit: creditSales,
          },
          dailyTrend,
        };
      });

      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  static async getProfitAndLoss(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const pnl = await withTenantContext(tenantId, async (tx) => {
        // 1. Total Revenue & COGS from Sales Line Items
        const saleItems = await tx.saleItem.findMany({
          where: {
            tenantId,
            sale: {
              saleDate: { gte: startDate, lte: endDate },
            },
          },
          include: { product: true },
        });

        let revenue = 0;
        let cogs = 0;

        for (const item of saleItems) {
          revenue += Number(item.lineTotal);
          const itemCost = Number(item.product.costPrice) * item.quantity;
          cogs += itemCost;
        }

        const grossProfit = revenue - cogs;

        // 2. Total Operational Expenses
        const expensesAggregate = await tx.expense.aggregate({
          where: {
            tenantId,
            expenseDate: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });

        const totalExpenses = Number(expensesAggregate._sum.amount || 0);
        const netProfit = grossProfit - totalExpenses;

        // 3. Group expenses by category for pie chart breakdown
        const expensesByCategory = await tx.expense.groupBy({
          by: ['category'],
          where: {
            tenantId,
            expenseDate: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });

        const categoryBreakdown = expensesByCategory.map((c) => ({
          category: c.category,
          amount: Number(c._sum.amount || 0),
        }));

        return {
          period: { startDate, endDate },
          revenue: Math.round(revenue * 100) / 100,
          costOfGoodsSold: Math.round(cogs * 100) / 100,
          grossProfit: Math.round(grossProfit * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          marginPercentage: revenue > 0 ? Math.round((netProfit / revenue) * 10000) / 100 : 0,
          categoryBreakdown,
        };
      });

      res.status(200).json({ success: true, data: pnl });
    } catch (err) {
      next(err);
    }
  }
}
