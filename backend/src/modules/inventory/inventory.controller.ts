import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';
import { z } from 'zod';

const restockSchema = z.object({
  productId: z.string().uuid(),
  quantityToAdd: z.number().int().positive('Quantity must be greater than 0'),
});

export class InventoryController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const lowStockOnly = req.query.lowStock === 'true';

      const inventory = await withTenantContext(tenantId, async (tx) => {
        return tx.inventory.findMany({
          where: {
            tenantId,
            ...(lowStockOnly ? { stockQuantity: { lte: 10 } } : {}),
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                sellingPrice: true,
                costPrice: true,
                isActive: true,
                category: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { stockQuantity: 'asc' },
        });
      });

      res.status(200).json({
        success: true,
        count: inventory.length,
        data: inventory,
      });
    } catch (err) {
      next(err);
    }
  }

  static async restock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = restockSchema.parse(req.body);

      const updated = await withTenantContext(tenantId, async (tx) => {
        // Verify inventory record exists and belongs to the authenticated tenant
        const existing = await tx.inventory.findFirst({
          where: {
            productId: validated.productId,
            tenantId,
          },
        });

        if (!existing) {
          const error: any = new Error('Inventory record not found for this product');
          error.status = 404;
          throw error;
        }

        return tx.inventory.update({
          where: {
            productId: validated.productId,
          },
          data: {
            stockQuantity: { increment: validated.quantityToAdd },
            lastRestockedDate: new Date(),
          },
          include: {
            product: { select: { id: true, name: true } },
          },
        });
      });

      res.status(200).json({
        success: true,
        message: `Restocked ${validated.quantityToAdd} units successfully`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
