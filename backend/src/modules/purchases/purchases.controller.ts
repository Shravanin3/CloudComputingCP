import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';
import { createPurchaseSchema } from './purchases.validation';

export class PurchaseController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const { purchases, total } = await withTenantContext(tenantId, async (tx) => {
        const [data, count] = await Promise.all([
          tx.purchase.findMany({
            where: { tenantId },
            include: {
              supplier: { select: { id: true, name: true, phone: true } },
              purchaseItems: {
                include: {
                  product: { select: { id: true, name: true, sku: true } },
                },
              },
            },
            orderBy: { purchaseDate: 'desc' },
            skip,
            take: limit,
          }),
          tx.purchase.count({ where: { tenantId } }),
        ]);
        return { purchases: data, total: count };
      });

      res.status(200).json({
        success: true,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data: purchases,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const purchase = await withTenantContext(tenantId, async (tx) => {
        return tx.purchase.findFirst({
          where: { id, tenantId },
          include: {
            supplier: true,
            purchaseItems: {
              include: { product: true },
            },
          },
        });
      });

      if (!purchase) {
        res.status(404).json({ success: false, error: 'Purchase record not found' });
        return;
      }

      res.status(200).json({ success: true, data: purchase });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Record Supplier Purchase & Restock Inventory:
   * 1. Creates Purchase and PurchaseItems records.
   * 2. Increments inventory stock for each product.
   * 3. Updates supplier payable balance if purchase is on credit (isPaid = false).
   * 4. Logs transaction entry.
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = createPurchaseSchema.parse(req.body);

      const result = await withTenantContext(tenantId, async (tx) => {
        let totalAmount = 0;
        const lineItemsToCreate: Array<{
          productId: string;
          quantity: number;
          unitCost: number;
          lineTotal: number;
        }> = [];

        for (const item of validated.items) {
          const product = await tx.product.findFirst({
            where: { id: item.productId, tenantId },
          });

          if (!product) {
            throw new Error(`Product not found (ID: ${item.productId})`);
          }

          const lineTotal = item.unitCost * item.quantity;
          totalAmount += lineTotal;

          lineItemsToCreate.push({
            productId: product.id,
            quantity: item.quantity,
            unitCost: item.unitCost,
            lineTotal,
          });
        }

        // 1. Create Purchase record
        const purchase = await tx.purchase.create({
          data: {
            tenantId,
            supplierId: validated.supplierId,
            totalAmount,
          },
        });

        // 2. Create Purchase Items & Increment Stock
        for (const item of lineItemsToCreate) {
          await tx.purchaseItem.create({
            data: {
              tenantId,
              purchaseId: purchase.id,
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              lineTotal: item.lineTotal,
            },
          });

          // Increment inventory stock
          await tx.inventory.upsert({
            where: { productId: item.productId },
            update: {
              stockQuantity: { increment: item.quantity },
              lastRestockedDate: new Date(),
            },
            create: {
              tenantId,
              productId: item.productId,
              stockQuantity: item.quantity,
            },
          });

          // Update cost price on product master catalog to reflect latest procurement price
          await tx.product.update({
            where: { id: item.productId, tenantId },
            data: { costPrice: item.unitCost },
          });
        }

        // 3. Update Supplier Payable Balance if on credit
        if (!validated.isPaid && validated.supplierId) {
          await tx.supplier.update({
            where: { id: validated.supplierId, tenantId },
            data: { payableBalance: { increment: totalAmount } },
          });

          await tx.transaction.create({
            data: {
              tenantId,
              entityType: 'SUPPLIER',
              entityId: validated.supplierId,
              amount: totalAmount, // Positive indicates debt owed to supplier
              referenceType: 'PURCHASE',
              referenceId: purchase.id,
            },
          });
        }

        return tx.purchase.findUnique({
          where: { id: purchase.id },
          include: {
            supplier: true,
            purchaseItems: { include: { product: true } },
          },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Stock purchase recorded successfully',
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes('Product not found')) {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      next(err);
    }
  }
}
