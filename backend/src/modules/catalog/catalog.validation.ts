import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
});

export const createProductSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Product name is required').max(255),
  sku: z.string().max(100).optional().nullable(),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  initialStock: z.number().int().min(0, 'Initial stock cannot be negative').default(0),
  attributes: z.record(z.any()).optional().default({}),
});

export const updateProductSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  sku: z.string().max(100).optional().nullable(),
  sellingPrice: z.number().positive().optional(),
  costPrice: z.number().min(0).optional(),
  attributes: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});
