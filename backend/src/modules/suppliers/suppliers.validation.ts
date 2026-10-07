import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  phone: z.string().optional(),
  payableBalance: z.number().nonnegative().optional().default(0),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const makeSupplierPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'UPI']).default('CASH'),
  notes: z.string().optional(),
});
