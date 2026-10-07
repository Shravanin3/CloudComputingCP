import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';
import { createSupplierSchema, updateSupplierSchema, makeSupplierPaymentSchema } from './suppliers.validation';

export class SupplierController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const search = req.query.search as string | undefined;

      const suppliers = await withTenantContext(tenantId, async (tx) => {
        return tx.supplier.findMany({
          where: {
            tenantId,
            ...(search
              ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          orderBy: { name: 'asc' },
        });
      });

      res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const supplier = await withTenantContext(tenantId, async (tx) => {
        return tx.supplier.findFirst({
          where: { id, tenantId },
          include: {
            purchases: {
              orderBy: { purchaseDate: 'desc' },
              take: 20,
              include: { purchaseItems: { include: { product: true } } },
            },
          },
        });
      });

      if (!supplier) {
        res.status(404).json({ success: false, error: 'Supplier not found' });
        return;
      }

      res.status(200).json({ success: true, data: supplier });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = createSupplierSchema.parse(req.body);

      const supplier = await withTenantContext(tenantId, async (tx) => {
        return tx.supplier.create({
          data: {
            tenantId,
            name: validated.name,
            phone: validated.phone,
            payableBalance: validated.payableBalance,
          },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const validated = updateSupplierSchema.parse(req.body);

      const updated = await withTenantContext(tenantId, async (tx) => {
        return tx.supplier.update({
          where: { id, tenantId },
          data: validated,
        });
      });

      res.status(200).json({
        success: true,
        message: 'Supplier updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Record payment made to supplier (reduces payable balance)
   */
  static async makePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const validated = makeSupplierPaymentSchema.parse(req.body);

      const result = await withTenantContext(tenantId, async (tx) => {
        const supplier = await tx.supplier.findFirst({
          where: { id, tenantId },
        });

        if (!supplier) {
          throw new Error('Supplier not found');
        }

        const newPayableBalance = Math.max(0, Number(supplier.payableBalance) - validated.amount);

        // 1. Update supplier payable balance
        const updatedSupplier = await tx.supplier.update({
          where: { id, tenantId },
          data: { payableBalance: newPayableBalance },
        });

        // 2. Insert payment transaction into unified ledger
        const ledgerTransaction = await tx.transaction.create({
          data: {
            tenantId,
            entityType: 'SUPPLIER',
            entityId: id,
            amount: -validated.amount, // Negative amount reduces payable debt
            referenceType: 'PAYMENT',
            referenceId: id,
          },
        });

        return { supplier: updatedSupplier, transaction: ledgerTransaction };
      });

      res.status(200).json({
        success: true,
        message: `Payment of ₹${validated.amount} to ${result.supplier.name} recorded`,
        data: result,
      });
    } catch (err: any) {
      if (err.message === 'Supplier not found') {
        res.status(404).json({ success: false, error: err.message });
        return;
      }
      next(err);
    }
  }
}
