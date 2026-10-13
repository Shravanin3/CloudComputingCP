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
        let finalCategoryId = validated.categoryId;

        // If categoryId was explicitly provided, verify it belongs to this tenant
        if (finalCategoryId) {
          const cat = await tx.category.findFirst({
            where: { id: finalCategoryId, tenantId },
          });
          if (!cat) {
            res.status(400).json({
              success: false,
              error: 'Invalid category: category does not belong to this store',
            });
            return;
          }
        } else if (validated.category && validated.category.trim()) {
          // If category name string was provided, find or create tenant-specific category
          const catName = validated.category.trim();
          let cat = await tx.category.findFirst({
            where: { tenantId, name: catName },
          });
          if (!cat) {
            cat = await tx.category.create({
              data: { tenantId, name: catName },
            });
          }
          finalCategoryId = cat.id;
        } else {
          // Default to tenant-specific 'General' category
          let defaultCat = await tx.category.findFirst({
            where: { tenantId, name: 'General' },
          });
          if (!defaultCat) {
            defaultCat = await tx.category.create({
              data: { tenantId, name: 'General' },
            });
          }
          finalCategoryId = defaultCat.id;
        }

        // 1. Create product
        const newProduct = await tx.product.create({
          data: {
            tenantId,
            categoryId: finalCategoryId,
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

      if (!res.headersSent) {
        res.status(201).json({
          success: true,
          message: 'Product created and inventory initialized successfully',
          data: product,
        });
      }
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
        // Pre-flight check: ensure product exists and belongs to tenant
        const existing = await tx.product.findFirst({
          where: { id, tenantId },
        });
        if (!existing) {
          res.status(404).json({ success: false, error: 'Product not found' });
          return;
        }

        let targetCategoryId = validated.categoryId;
        if (targetCategoryId) {
          const cat = await tx.category.findFirst({
            where: { id: targetCategoryId, tenantId },
          });
          if (!cat) {
            res.status(400).json({
              success: false,
              error: 'Invalid category: category does not belong to this store',
            });
            return;
          }
        } else if (validated.category && validated.category.trim()) {
          const catName = validated.category.trim();
          let cat = await tx.category.findFirst({
            where: { tenantId, name: catName },
          });
          if (!cat) {
            cat = await tx.category.create({
              data: { tenantId, name: catName },
            });
          }
          targetCategoryId = cat.id;
        }

        // Exclude non-schema 'category' string field before passing to Prisma
        const { category: _ignoredCategoryStr, ...prismaData } = validated;
        if (targetCategoryId) {
          prismaData.categoryId = targetCategoryId;
        }

        return tx.product.update({
          where: { id },
          data: prismaData,
        });
      });

      if (!res.headersSent) {
        res.status(200).json({
          success: true,
          message: 'Product updated successfully',
          data: updated,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const deleted = await withTenantContext(tenantId, async (tx) => {
        const existing = await tx.product.findFirst({
          where: { id, tenantId },
        });
        if (!existing) {
          res.status(404).json({ success: false, error: 'Product not found' });
          return;
        }

        // Soft delete to protect historical invoice referential integrity
        return tx.product.update({
          where: { id },
          data: { isActive: false },
        });
      });

      if (!res.headersSent) {
        res.status(200).json({
          success: true,
          message: 'Product deactivated successfully',
        });
      }
    } catch (err) {
      next(err);
    }
  }
}
