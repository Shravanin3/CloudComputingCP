import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';

export class LedgerController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const entityType = req.query.entityType as 'CUSTOMER' | 'SUPPLIER' | undefined;
      const entityId = req.query.entityId as string | undefined;

      const transactions = await withTenantContext(tenantId, async (tx) => {
        return tx.transaction.findMany({
          where: {
            tenantId,
            ...(entityType ? { entityType } : {}),
            ...(entityId ? { entityId } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
      });

      res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (err) {
      next(err);
    }
  }
}
