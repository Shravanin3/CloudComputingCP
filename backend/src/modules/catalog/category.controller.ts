import { Request, Response, NextFunction } from 'express';
import { prisma, withTenantContext } from '../../config/database';
import { createCategorySchema, updateCategorySchema } from './catalog.validation';

export class CategoryController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const categories = await withTenantContext(tenantId, async (tx) => {
        return tx.category.findMany({
          where: { tenantId },
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        });
      });

      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = createCategorySchema.parse(req.body);

      const category = await withTenantContext(tenantId, async (tx) => {
        return tx.category.create({
          data: {
            tenantId,
            name: validated.name,
          },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const validated = updateCategorySchema.parse(req.body);

      const updated = await withTenantContext(tenantId, async (tx) => {
        return tx.category.update({
          where: { id, tenantId },
          data: { name: validated.name },
        });
      });

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
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

      await withTenantContext(tenantId, async (tx) => {
        return tx.category.delete({
          where: { id, tenantId },
        });
      });

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
