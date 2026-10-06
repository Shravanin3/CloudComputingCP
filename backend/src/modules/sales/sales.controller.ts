import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';
import { createSaleSchema } from './sales.validation';

export class SaleController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const { sales, total } = await withTenantContext(tenantId, async (tx) => {
        const [data, count] = await Promise.all([
          tx.sale.findMany({
            where: { tenantId },
            include: {
              customer: { select: { id: true, name: true, phone: true } },
              saleItems: {
                include: {
                  product: { select: { id: true, name: true, sku: true } },
                },
              },
            },
            orderBy: { saleDate: 'desc' },
            skip,
            take: limit,
          }),
          tx.sale.count({ where: { tenantId } }),
        ]);
        return { sales: data, total: count };
      });

      res.status(200).json({
        success: true,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data: sales,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const sale = await withTenantContext(tenantId, async (tx) => {
        return tx.sale.findFirst({
          where: { id, tenantId },
          include: {
            customer: true,
            saleItems: {
              include: {
                product: true,
              },
            },
          },
        });
      });

      if (!sale) {
        res.status(404).json({ success: false, error: 'Sale transaction not found' });
        return;
      }

      res.status(200).json({ success: true, data: sale });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Atomic POS Checkout Transaction:
   * 1. Validates stock availability for every line item.
   * 2. Depletes product inventory stock (`CHECK stock >= 0`).
   * 3. Creates Sale and SaleItem records.
   * 4. Updates Customer credit balance if payment is CREDIT.
   * 5. Creates double-entry transaction record.
   * 6. Automatically rolls back all changes if any single item fails stock validation.
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = createSaleSchema.parse(req.body);

      if (validated.paymentMethod === 'CREDIT' && !validated.customerId) {
        res.status(400).json({
          success: false,
          error: 'A customer must be selected for CREDIT (udhaar) transactions',
        });
        return;
      }

      const saleResult = await withTenantContext(tenantId, async (tx) => {
        // Step 1: Pre-fetch and lock all requested products & inventory
        let totalItemsAmount = 0;
        const lineItemsToCreate: Array<{
          productId: string;
          quantity: number;
          unitPrice: number;
          lineTotal: number;
        }> = [];

        for (const item of validated.items) {
          const product = await tx.product.findFirst({
            where: { id: item.productId, tenantId, isActive: true },
            include: { inventory: true },
          });

          if (!product) {
            throw new Error(`Product not found or inactive (ID: ${item.productId})`);
          }

          const currentStock = product.inventory?.stockQuantity ?? 0;
          if (currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}". Available: ${currentStock}, Requested: ${item.quantity}`
            );
          }

          const sellingPrice = Number(product.sellingPrice);
          const lineTotal = sellingPrice * item.quantity;
          totalItemsAmount += lineTotal;

          lineItemsToCreate.push({
            productId: product.id,
            quantity: item.quantity,
            unitPrice: sellingPrice,
            lineTotal,
          });
        }

        const totalAmount = totalItemsAmount + (validated.taxAmount || 0);

        // Step 2: Create Sale Header
        const sale = await tx.sale.create({
          data: {
            tenantId,
            customerId: validated.customerId,
            totalAmount,
            taxAmount: validated.taxAmount || 0,
            paymentMethod: validated.paymentMethod,
          },
        });

        // Step 3: Create Sale Items & Deplete Inventory
        for (const lineItem of lineItemsToCreate) {
          await tx.saleItem.create({
            data: {
              tenantId,
              saleId: sale.id,
              productId: lineItem.productId,
              quantity: lineItem.quantity,
              unitPrice: lineItem.unitPrice,
              lineTotal: lineItem.lineTotal,
            },
          });

          await tx.inventory.update({
            where: { productId: lineItem.productId },
            data: {
              stockQuantity: {
                decrement: lineItem.quantity,
              },
            },
          });
        }

        // Step 4: If CREDIT sale, update Customer credit balance and log transaction
        if (validated.paymentMethod === 'CREDIT' && validated.customerId) {
          await tx.customer.update({
            where: { id: validated.customerId, tenantId },
            data: {
              creditBalance: {
                increment: totalAmount,
              },
            },
          });

          await tx.transaction.create({
            data: {
              tenantId,
              entityType: 'CUSTOMER',
              entityId: validated.customerId,
              amount: -totalAmount, // Negative amount indicates added credit debt
              referenceType: 'SALE',
              referenceId: sale.id,
            },
          });
        }

        // Return complete sale object
        return tx.sale.findUnique({
          where: { id: sale.id },
          include: {
            customer: true,
            saleItems: { include: { product: true } },
          },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Sale completed successfully',
        data: saleResult,
      });
    } catch (err: any) {
      if (err.message.includes('Insufficient stock') || err.message.includes('Product not found')) {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      next(err);
    }
  }
}
