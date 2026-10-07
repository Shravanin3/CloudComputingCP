import { z } from 'zod';

export const createPurchaseItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitCost: z.number().positive('Unit cost must be greater than zero'),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID format').optional().nullable(),
  isPaid: z.boolean().default(true),
  items: z.array(createPurchaseItemSchema).min(1, 'Purchase must contain at least one item'),
});
