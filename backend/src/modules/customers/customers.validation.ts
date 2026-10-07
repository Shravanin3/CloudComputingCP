import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  creditBalance: z.number().nonnegative().optional().default(0),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const receivePaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'UPI']).default('CASH'),
  notes: z.string().optional(),
});
