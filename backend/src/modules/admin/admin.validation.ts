import { z } from 'zod';

export const createAdminSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT']).default('MODERATOR'),
});

export const updateAdminRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT']),
});

export const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
});

export const broadcastSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  roleFilter: z.enum(['CUSTOMER', 'TASKER', 'ALL']).default('ALL'),
});

export const targetedNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(1000),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const userSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(['CUSTOMER', 'TASKER', 'ADMIN']).optional(),
  status: z.enum(['active', 'suspended', 'deleted']).optional(),
});

export const taskFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const taskerFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  isOnline: z.coerce.boolean().optional(),
});

export const paymentFilterSchema = paginationSchema.extend({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
});

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(1).max(2000),
  action: z.enum(['refund_customer', 'release_tasker', 'cancel_task', 'none']).default('none'),
});

export const refundInputSchema = z.object({
  amount: z.number().positive(),
  reason: z.enum(['DUPLICATE', 'FRAUD', 'CUSTOMER_REQUEST', 'TASK_CANCELLED', 'SERVICE_ISSUE', 'OTHER']),
  reasonDetail: z.string().max(500).optional(),
});

export const payoutSchema = z.object({
  walletId: z.string().uuid(),
  amount: z.number().positive(),
});

export const reportQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

export const growthQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
