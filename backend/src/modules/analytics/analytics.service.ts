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

export async function getUserGrowth(days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return aggregateByDate(users, days);
}

export async function getTaskGrowth(days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const tasks = await prisma.task.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return aggregateByDate(tasks, days);
}

export async function getRevenueTrend(days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const payments = await prisma.payment.findMany({
    where: { paymentStatus: 'PAID', paidAt: { gte: start } },
    select: { amount: true, paidAt: true },
    orderBy: { paidAt: 'asc' },
  });
  const filtered = payments.filter((p) => p.paidAt) as { amount: unknown; paidAt: Date }[];
  return aggregateByDate(filtered, days, 'amount');
}

export async function getPopularCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { name: 'asc' },
  });
  return categories
    .filter((c) => c._count.tasks > 0)
    .map((c) => ({ name: c.name, count: c._count.tasks }))
    .sort((a, b) => b.count - a.count);
}

function aggregateByDate(
  data: { createdAt?: Date; paidAt?: Date; [key: string]: unknown }[],
  days: number,
  valueField?: string,
): { date: string; value: number }[] {
  const points: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const items = data.filter((item) => {
      const dt = item.paidAt ?? item.createdAt;
      return dt ? dt.toISOString().slice(0, 10) === dateStr : false;
    });
    const value = valueField
      ? items.reduce((sum: number, item) => sum + Number(item[valueField] ?? 0), 0)
      : items.length;
    points.push({ date: dateStr, value });
  }
  return points;
}

export async function getTaskAnalytics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,
    tasksCreatedToday,
    tasksCompletedToday,
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: 'PENDING' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({ where: { status: 'CANCELLED' } }),
    prisma.task.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.task.count({ where: { completedAt: { gte: startOfToday } } }),
  ]);

  return {
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,
    tasksCreatedToday,
    tasksCompletedToday,
  };
}

export async function getRevenueAnalytics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const paidFilter = { paymentStatus: 'PAID' as const };

  const [
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    totalPlatformRevenue,
    platformFees,
    pendingPayouts,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { ...paidFilter, paidAt: { gte: startOfToday } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { ...paidFilter, paidAt: { gte: startOfWeek } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { ...paidFilter, paidAt: { gte: startOfMonth } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: paidFilter,
    }),
    prisma.payment.aggregate({
      _sum: { platformFee: true },
      where: paidFilter,
    }),
    prisma.wallet.aggregate({
      _sum: { pendingBalance: true },
    }),
  ]);

  return {
    revenueToday: revenueToday._sum.amount ?? 0,
    revenueThisWeek: revenueThisWeek._sum.amount ?? 0,
    revenueThisMonth: revenueThisMonth._sum.amount ?? 0,
    totalPlatformRevenue: totalPlatformRevenue._sum.amount ?? 0,
    platformFeesCollected: platformFees._sum.platformFee ?? 0,
    pendingPayouts: pendingPayouts._sum.pendingBalance ?? 0,
  };
}

export async function getUserAnalytics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeWhere = { deletedAt: null };

  const [
    totalUsers,
    totalCustomers,
    totalTaskers,
    onlineTaskersCount,
    newUsersTodayCount,
    newUsersThisWeekCount,
    newUsersThisMonthCount,
  ] = await Promise.all([
    prisma.user.count({ where: activeWhere }),
    prisma.user.count({ where: { ...activeWhere, role: 'CUSTOMER' } }),
    prisma.user.count({ where: { ...activeWhere, role: 'TASKER' } }),
    prisma.taskerProfile.count({ where: { isOnline: true } }),
    prisma.user.count({ where: { ...activeWhere, createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { ...activeWhere, createdAt: { gte: startOfWeek } } }),
    prisma.user.count({ where: { ...activeWhere, createdAt: { gte: startOfMonth } } }),
  ]);

  return {
    totalUsers,
    totalCustomers,
    totalTaskers,
    onlineTaskers: onlineTaskersCount,
    newUsersToday: newUsersTodayCount,
    newUsersThisWeek: newUsersThisWeekCount,
    newUsersThisMonth: newUsersThisMonthCount,
  };
}
