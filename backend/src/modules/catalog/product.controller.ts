import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';
import { createProductSchema, updateProductSchema } from './catalog.validation';

export class ProductController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const categoryId = req.query.categoryId as string | undefined;
      const search = req.query.search as string | undefined;

      const products = await withTenantContext(tenantId, async (tx) => {
        return tx.product.findMany({
          where: {
            tenantId,
            isActive: true,
            ...(categoryId ? { categoryId } : {}),
            ...(search
              ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          include: {
            category: { select: { id: true, name: true } },
            inventory: { select: { stockQuantity: true, lastRestockedDate: true } },
          },
          orderBy: { name: 'asc' },
        });
      });

      res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const product = await withTenantContext(tenantId, async (tx) => {
        return tx.product.findFirst({
          where: { id, tenantId },
          include: {
            category: { select: { id: true, name: true } },
            inventory: { select: { stockQuantity: true, lastRestockedDate: true } },
          },
        });
      });

      if (!product) {
        res.status(404).json({ success: false, error: 'Product not found' });
        return;
      }

      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = createProductSchema.parse(req.body);

      const product = await withTenantContext(tenantId, async (tx) => {
        // 1. Create product
        const newProduct = await tx.product.create({
          data: {
            tenantId,
            categoryId: validated.categoryId,
            name: validated.name,
            sku: validated.sku,
            sellingPrice: validated.sellingPrice,
            costPrice: validated.costPrice,
            attributes: validated.attributes,
          },
        });

        // 2. Initialize inventory record
        await tx.inventory.create({
          data: {
            tenantId,
            productId: newProduct.id,
            stockQuantity: validated.initialStock,
          },
        });

        return newProduct;
      });

      res.status(201).json({
        success: true,
        message: 'Product created and inventory initialized successfully',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const validated = updateProductSchema.parse(req.body);

      const updated = await withTenantContext(tenantId, async (tx) => {
        return tx.product.update({
          where: { id, tenantId },
          data: validated,
        });
      });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      // Soft delete to protect historical invoice referential integrity
      await withTenantContext(tenantId, async (tx) => {
        return tx.product.update({
          where: { id, tenantId },
          data: { isActive: false },
        });
      });

      res.status(200).json({
        success: true,
        message: 'Product deactivated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
