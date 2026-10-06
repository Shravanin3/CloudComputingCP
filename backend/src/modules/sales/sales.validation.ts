import { z } from 'zod';

export const createSaleItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format').optional().nullable(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CREDIT']),
  taxAmount: z.number().nonnegative().optional().default(0),
  items: z.array(createSaleItemSchema).min(1, 'Sale must contain at least one item'),
});
