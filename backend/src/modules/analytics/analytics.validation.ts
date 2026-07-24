import { z } from 'zod';

export const trackEventSchema = z.object({
  event: z.string().min(1).max(100),
  category: z.string().max(50).optional(),
  label: z.string().max(200).optional(),
  value: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const analyticsQuerySchema = z.object({
  event: z.string().optional(),
  category: z.string().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const analyticsSummarySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});
