import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2500),
  categoryId: z.string().uuid('Valid category ID required'),
  location: z.string().trim().min(2, 'Location is required').max(150),
  roomNumber: z.string().trim().max(50).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export const updateComplaintSchema = z.object({
  title: z.string().trim().min(5).max(150).optional(),
  description: z.string().trim().min(10).max(2500).optional(),
  categoryId: z.string().uuid().optional(),
  location: z.string().trim().min(2).max(150).optional(),
  roomNumber: z.string().trim().max(50).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export const addCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1500),
  isInternal: z.boolean().optional().default(false),
});

export const reopenComplaintSchema = z.object({
  reopenReason: z.string().trim().min(5, 'A valid reason for reopening is required').max(500),
});

export const updateStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'REOPENED']),
  notes: z.string().trim().max(1000).optional(),
  rejectionReason: z.string().trim().min(5, 'Rejection explanation is required').max(500).optional(),
  resolutionSummary: z.string().trim().min(5, 'Resolution summary is required').max(1000).optional(),
});

export const assignComplaintSchema = z.object({
  staffId: z.string().uuid('Valid staff member ID required'),
  notes: z.string().trim().max(500).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});
