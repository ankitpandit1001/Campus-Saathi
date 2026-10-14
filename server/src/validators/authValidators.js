import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  studentId: z.string().trim().nullable().optional(),
  department: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  institutionId: z.string().trim().nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  institutionId: z.string().trim().nullable().optional(),
});

export const switchInstitutionSchema = z.object({
  institutionId: z.string().trim().min(1, 'institutionId is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128),
});
