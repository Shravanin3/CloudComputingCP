import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';
import { createExpenseSchema } from './expenses.validation';

export class ExpenseController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const category = req.query.category as string | undefined;

      const expenses = await withTenantContext(tenantId, async (tx) => {
        return tx.expense.findMany({
          where: {
            tenantId,
            ...(category ? { category } : {}),
          },
          orderBy: { expenseDate: 'desc' },
        });
      });

      res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = createExpenseSchema.parse(req.body);

      const expense = await withTenantContext(tenantId, async (tx) => {
        return tx.expense.create({
          data: {
            tenantId,
            amount: validated.amount,
            category: validated.category,
            description: validated.description,
            expenseDate: validated.expenseDate ? new Date(validated.expenseDate) : new Date(),
          },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Expense recorded successfully',
        data: expense,
      });
    } catch (err) {
      next(err);
    }
  }
}
