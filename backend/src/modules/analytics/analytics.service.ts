import { prisma } from '../../prisma/client';
import type { Prisma } from '@prisma/client';

interface TrackEventData {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  userId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export async function trackEvent(data: TrackEventData) {
  const event = await prisma.analyticsEvent.create({ data });
  return event;
}

interface GetEventsQuery {
  event?: string;
  category?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export async function getEvents(query: GetEventsQuery) {
  const where: Prisma.AnalyticsEventWhereInput = {};
  if (query.event) where.event = query.event;
  if (query.category) where.category = query.category;
  if (query.userId) where.userId = query.userId;
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
    if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
  }

  const [events, total] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: query.offset ?? 0,
      take: query.limit ?? 50,
    }),
    prisma.analyticsEvent.count({ where }),
  ]);

  return { events, total };
}

export async function getEventById(id: string) {
  const event = await prisma.analyticsEvent.findUnique({ where: { id } });
  return event;
}

export async function deleteEvents(dateFrom?: string, dateTo?: string) {
  const where: Prisma.AnalyticsEventWhereInput = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const { count } = await prisma.analyticsEvent.deleteMany({ where });
  return { deletedCount: count };
}

export async function getSummary(dateFrom?: string, dateTo?: string) {
  const where: Prisma.AnalyticsEventWhereInput = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [totalEvents, eventBreakdown, topUsers] = await Promise.all([
    prisma.analyticsEvent.count({ where }),
    prisma.analyticsEvent.groupBy({
      by: ['event'],
      where,
      _count: true,
      orderBy: { _count: { event: 'desc' } },
      take: 20,
    }),
    prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { ...where, userId: { not: null } },
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    totalEvents,
    eventBreakdown: eventBreakdown.map((e) => ({ event: e.event, count: e._count })),
    topUsers: topUsers.map((u) => ({ userId: u.userId, count: u._count })),
  };
}
