import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  department: z.string().trim().min(2, 'Department is required').max(100),
  phone: z.string().trim().max(20).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(500),
  slaHours: z.coerce.number().int().min(1, 'SLA must be at least 1 hour').max(720).default(48),
  isActive: z.boolean().optional().default(true),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});
