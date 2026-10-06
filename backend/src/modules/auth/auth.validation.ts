import { z } from 'zod';

export const registerSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
  gstinNumber: z.string().max(15, 'GSTIN must not exceed 15 characters').optional(),
  address: z.string().optional(),
  name: z.string().min(2, 'User name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
