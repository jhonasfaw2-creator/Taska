import { prisma } from '../../prisma/client';
import { AppError } from '../../common/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../common/config/env';
import { createAuditLog } from './audit.service';
import { logFailedLogin } from '../../common/middleware/security.middleware';

// ─── Admin Auth ─────────────────────────────────────────

export async function loginAdmin(phoneNumber: string, password: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    include: { adminUser: true },
  });
  if (!user || !user.adminUser || user.deletedAt) {
    await logFailedLogin(phoneNumber, 'account_not_found_or_deleted', ipAddress);
    throw new AppError('Invalid credentials.', 401);
  }
  if (!user.password) {
    await logFailedLogin(phoneNumber, 'no_password_set', ipAddress);
    throw new AppError('Admin account has no password set. Contact a SUPER_ADMIN.', 401);
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await logFailedLogin(phoneNumber, 'invalid_password', ipAddress);
    throw new AppError('Invalid credentials.', 401);
  }
  const token = jwt.sign(
    { userId: user.id, phoneNumber: user.phoneNumber, role: user.role, adminRole: user.adminUser.role },
    envConfig.jwtSecret,
    { expiresIn: envConfig.jwtAccessExpiresIn as any },
  );
  await prisma.adminUser.update({
    where: { id: user.adminUser.id },
    data: { lastLoginAt: new Date() },
  });
  return {
    token,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.adminUser.role,
      permissions: user.adminUser.permissions,
    },
  };
}

// ─── Dashboard ──────────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeCustomers,
    activeTaskers,
    onlineTaskers,
    tasksToday,
    tasksInProgress,
    completedTasks,
    cancelledTasks,
    pendingVerifications,
    paymentsToday,
    paymentsThisMonth,
    walletAgg,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
    prisma.user.count({ where: { role: 'TASKER', deletedAt: null } }),
    prisma.taskerProfile.count({ where: { isOnline: true } }),
    prisma.task.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count({ where: { status: 'CANCELLED' } }),
    prisma.taskerProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: 'PAID', createdAt: { gte: todayStart } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } },
    }),
    prisma.wallet.aggregate({
      _sum: { balance: true, pendingBalance: true, availableBalance: true },
    }),
  ]);

  return {
    totalUsers,
    activeCustomers,
    activeTaskers,
    onlineTaskers,
    tasksToday,
    tasksInProgress,
    completedTasks,
    cancelledTasks,
    pendingVerifications,
    revenueToday: paymentsToday._sum.amount ?? 0,
    revenueThisMonth: paymentsThisMonth._sum.amount ?? 0,
    totalWalletBalance: walletAgg._sum.balance ?? 0,
    totalPendingBalance: walletAgg._sum.pendingBalance ?? 0,
    totalAvailableBalance: walletAgg._sum.availableBalance ?? 0,
  };
}

export async function getUserGrowth(days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
  return aggregateTimeSeries(users, days);
}

export async function getTaskGrowth(days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const tasks = await prisma.task.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return aggregateTimeSeries(tasks, days);
}

export async function getRevenueGrowth(days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const payments = await prisma.payment.findMany({
    where: { paymentStatus: 'PAID', createdAt: { gte: start } },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return aggregateTimeSeries(payments, days, 'amount');
}

export async function getTaskCategoryDistribution() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { name: 'asc' },
  });
  return categories.map((c) => ({ name: c.name, count: c._count.tasks }));
}

function aggregateTimeSeries(
  data: { createdAt: Date; [key: string]: any }[],
  days: number,
  valueField?: string,
) {
  const points: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const items = data.filter((item) => item.createdAt.toISOString().slice(0, 10) === dateStr);
    const value = valueField
      ? items.reduce((sum: number, item: any) => sum + Number(item[valueField] ?? 0), 0)
      : items.length;
    points.push({ date: dateStr, value });
  }
  return points;
}

// ─── User Management ────────────────────────────────────

export async function resetUserVerification(userId: string, adminId: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { taskerProfile: true },
  });
  if (!user) throw new AppError('User not found.', 404);

  // Reset user verification
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: false },
  });

  // If user has a tasker profile, reset its verification status too
  if (user.taskerProfile) {
    await prisma.taskerProfile.update({
      where: { userId },
      data: { verificationStatus: 'PENDING' },
    });
  }

  await createAuditLog({ adminId, action: 'reset_verification', entityType: 'user', entityId: userId, ipAddress });
  return { message: 'User verification has been reset.' };
}

export async function resetUserAccount(userId: string, adminId: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { taskerProfile: true },
  });
  if (!user) throw new AppError('User not found.', 404);

  // Reset account: clear profile data, reset onboarding, clear verification
  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: null,
      lastName: null,
      email: null,
      profileImage: null,
      isVerified: false,
      isOnboarded: false,
      otp: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      refreshToken: null,
    },
  });

  // If user has a tasker profile, reset its verification status
  if (user.taskerProfile) {
    await prisma.taskerProfile.update({
      where: { userId },
      data: { verificationStatus: 'PENDING' },
    });
  }

  await createAuditLog({ adminId, action: 'reset_account', entityType: 'user', entityId: userId, ipAddress });
  return { message: 'User account has been reset.' };
}


export async function listUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  limit: number;
  offset: number;
}) {
  const where: any = {};
  if (params.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: 'insensitive' } },
      { lastName: { contains: params.search, mode: 'insensitive' } },
      { phoneNumber: { contains: params.search } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.role) where.role = params.role;
  if (params.status === 'suspended') where.deletedAt = { not: null };
  else if (params.status === 'active') where.deletedAt = null;
  else where.deletedAt = null;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true, phoneNumber: true, email: true,
        role: true, isVerified: true, isOnboarded: true, deletedAt: true,
        createdAt: true, updatedAt: true,
        taskerProfile: { select: { verificationStatus: true, isOnline: true, rating: true, totalTasksCompleted: true } },
        _count: { select: { tasks: true, payments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.offset,
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total };
}

export async function getUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      taskerProfile: {
        include: {
          vehicles: true,
          verificationDocuments: true,
          wallet: true,
          _count: { select: { tasks: true, offers: true } },
        },
      },
      ratingSummary: true,
      _count: { select: { tasks: true, payments: true, notifications: true } },
    },
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
}

export async function updateUser(userId: string, data: any) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);
  return prisma.user.update({ where: { id: userId }, data });
}

export async function suspendUser(userId: string, adminId: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);
  if (user.deletedAt) throw new AppError('User is already suspended.', 400);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
  await createAuditLog({ adminId, action: 'suspend_user', entityType: 'user', entityId: userId, ipAddress });
  return updated;
}

export async function reactivateUser(userId: string, adminId: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);
  if (!user.deletedAt) throw new AppError('User is not suspended.', 400);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  });
  await createAuditLog({ adminId, action: 'reactivate_user', entityType: 'user', entityId: userId, ipAddress });
  return updated;
}

export async function deleteUser(userId: string, adminId: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
  await createAuditLog({ adminId, action: 'soft_delete_user', entityType: 'user', entityId: userId, ipAddress });
  return updated;
}

// ─── Task Management ────────────────────────────────────

export async function listTasks(params: {
  search?: string;
  status?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
}) {
  const where: any = {};
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.status) where.status = params.status;
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.dateFrom || params.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
    if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
  }
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } },
        tasker: { select: { id: true, userId: true, user: { select: { firstName: true, lastName: true } } } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.offset,
    }),
    prisma.task.count({ where }),
  ]);
  return { tasks, total };
}

export async function getTaskDetails(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, email: true } },
      tasker: { include: { user: { select: { firstName: true, lastName: true, phoneNumber: true } } } },
      category: true,
      payment: true,
      images: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      conversations: { include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } } },
      reviews: true,
      offers: { include: { tasker: { select: { id: true, user: { select: { firstName: true, lastName: true } } } } } },
    },
  });
  if (!task) throw new AppError('Task not found.', 404);
  return task;
}

export async function cancelTask(taskId: string, reason: string, adminId: string, ipAddress?: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found.', 404);
  if (['COMPLETED', 'CANCELLED'].includes(task.status)) {
    throw new AppError('Task cannot be cancelled in its current state.', 400);
  }
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: 'CANCELLED' },
  });
  await prisma.taskStatusHistory.create({
    data: { taskId, status: 'CANCELLED', changedBy: 'admin' },
  });
  await createAuditLog({ adminId, action: 'cancel_task', entityType: 'task', entityId: taskId, changes: { reason }, ipAddress });
  return updated;
}

export async function reassignTask(taskId: string, newTaskerId: string, adminId: string, ipAddress?: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError('Task not found.', 404);
  const tasker = await prisma.taskerProfile.findUnique({ where: { id: newTaskerId } });
  if (!tasker) throw new AppError('Tasker not found.', 404);
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { taskerId: newTaskerId, status: 'ACCEPTED' },
  });
  await prisma.taskStatusHistory.create({
    data: { taskId, status: 'ACCEPTED', changedBy: 'admin' },
  });
  await createAuditLog({ adminId, action: 'reassign_task', entityType: 'task', entityId: taskId, changes: { newTaskerId }, ipAddress });
  return updated;
}

// ─── Tasker Management ──────────────────────────────────

export async function listTaskers(params: {
  search?: string;
  verificationStatus?: string;
  isOnline?: boolean;
  limit: number;
  offset: number;
}) {
  const where: any = {};
  if (params.search) {
    where.user = {
      OR: [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { phoneNumber: { contains: params.search } },
      ],
    };
  }
  if (params.verificationStatus) where.verificationStatus = params.verificationStatus;
  if (params.isOnline !== undefined) where.isOnline = params.isOnline;

  const [taskers, total] = await Promise.all([
    prisma.taskerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, email: true, createdAt: true } },
        wallet: { select: { balance: true, availableBalance: true, totalEarned: true, totalWithdrawn: true } },
        vehicles: true,
        _count: { select: { tasks: true, offers: true, verificationDocuments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.offset,
    }),
    prisma.taskerProfile.count({ where }),
  ]);
  return { taskers, total };
}

export async function getTaskerDetails(taskerId: string) {
  const tasker = await prisma.taskerProfile.findUnique({
    where: { id: taskerId },
    include: {
      user: { include: { receivedReviews: { include: { reviewer: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' as const }, take: 20 } } },
      wallet: true,
      vehicles: true,
      verificationDocuments: { orderBy: { createdAt: 'desc' } },
      tasks: { orderBy: { createdAt: 'desc' }, take: 20, include: { category: { select: { name: true } } } },
      _count: { select: { offers: true } },
    },
  });
  if (!tasker) throw new AppError('Tasker not found.', 404);
  return tasker;
}

export async function approveTasker(taskerId: string, adminId: string, ipAddress?: string) {
  return updateTaskerStatus(taskerId, 'APPROVED', adminId, ipAddress);
}

export async function rejectTasker(taskerId: string, adminId: string, ipAddress?: string) {
  return updateTaskerStatus(taskerId, 'REJECTED', adminId, ipAddress);
}

export async function suspendTasker(taskerId: string, adminId: string, ipAddress?: string) {
  return updateTaskerStatus(taskerId, 'SUSPENDED', adminId, ipAddress);
}

async function updateTaskerStatus(taskerId: string, status: string, adminId: string, ipAddress?: string) {
  const tasker = await prisma.taskerProfile.findUnique({ where: { id: taskerId } });
  if (!tasker) throw new AppError('Tasker not found.', 404);
  const updated = await prisma.taskerProfile.update({
    where: { id: taskerId },
    data: { verificationStatus: status as any },
  });
  await createAuditLog({
    adminId, action: `${status.toLowerCase()}_tasker`, entityType: 'tasker', entityId: taskerId,
    changes: { previousStatus: tasker.verificationStatus, newStatus: status }, ipAddress,
  });
  return updated;
}

// ─── Payment Management ─────────────────────────────────

export async function listAllPayments(params: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
}) {
  const where: any = {};
  if (params.status) where.paymentStatus = params.status;
  if (params.dateFrom || params.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
    if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
  }
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } },
        task: { select: { id: true, title: true, status: true } },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.offset,
    }),
    prisma.payment.count({ where }),
  ]);
  return { payments, total };
}

export async function getPaymentDetails(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      customer: true,
      task: { include: { tasker: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      refunds: true,
      audits: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!payment) throw new AppError('Payment not found.', 404);
  return payment;
}

export async function listAllWallets(params: { limit: number; offset: number }) {
  const [wallets, total] = await Promise.all([
    prisma.wallet.findMany({
      include: {
        tasker: { include: { user: { select: { firstName: true, lastName: true, phoneNumber: true } } } },
        _count: { select: { transactions: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: params.limit,
      skip: params.offset,
    }),
    prisma.wallet.count(),
  ]);
  return { wallets, total };
}

// ─── Dispute Resolution ─────────────────────────────────

export async function resolveDispute(
  taskId: string,
  resolution: string,
  action: 'refund_customer' | 'release_tasker' | 'cancel_task' | 'none',
  adminId: string,
  ipAddress?: string,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { payment: true, tasker: { include: { wallet: true } }, customer: true },
  });
  if (!task) throw new AppError('Task not found.', 404);

  const result: any = { resolution, action, taskId, previousStatus: task.status };

  switch (action) {
    case 'cancel_task': {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'CANCELLED' },
      });
      await prisma.taskStatusHistory.create({
        data: { taskId, status: 'CANCELLED', changedBy: 'admin (dispute)' },
      });
      result.newStatus = 'CANCELLED';
      break;
    }
    case 'refund_customer': {
      if (task.payment) {
        await prisma.payment.update({
          where: { id: task.payment.id },
          data: { paymentStatus: 'REFUNDED', refundedAmount: task.payment.amount },
        });
      }
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'CANCELLED' },
      });
      await prisma.taskStatusHistory.create({
        data: { taskId, status: 'CANCELLED', changedBy: 'admin (refund)' },
      });
      result.newStatus = 'CANCELLED';
      result.refunded = true;
      break;
    }
    case 'release_tasker': {
      if (task.taskerId) {
        // Release the tasker from this task
        await prisma.task.update({
          where: { id: taskId },
          data: { taskerId: null, status: 'SEARCHING' },
        });
        await prisma.taskStatusHistory.create({
          data: { taskId, status: 'SEARCHING', changedBy: 'admin (release)' },
        });
        result.newStatus = 'SEARCHING';
      }
      break;
    }
    case 'none':
    default:
      result.newStatus = task.status;
      break;
  }

  await createAuditLog({
    adminId, action: 'resolve_dispute', entityType: 'task', entityId: taskId,
    changes: { resolution, action, previousStatus: task.status, newStatus: result.newStatus }, ipAddress,
  });

  return result;
}

// ─── Payouts ────────────────────────────────────────────

export async function approvePayout(walletId: string, amount: number, adminId: string, ipAddress?: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: { tasker: { include: { user: { select: { firstName: true, lastName: true } } } } },
  });
  if (!wallet) throw new AppError('Wallet not found.', 404);
  if (Number(wallet.availableBalance) < amount) {
    throw new AppError('Insufficient available balance.', 400);
  }

  const updated = await prisma.wallet.update({
    where: { id: walletId },
    data: {
      balance: { decrement: amount },
      availableBalance: { decrement: amount },
      totalWithdrawn: { increment: amount },
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId,
      type: 'PAYOUT',
      amount: -amount,
      description: `Admin payout approved by ${adminId}`,
    },
  });

  await createAuditLog({
    adminId, action: 'approve_payout', entityType: 'wallet', entityId: walletId,
    changes: { amount, taskerId: wallet.taskerId }, ipAddress,
  });

  return { balance: Number(updated.balance), amount, taskerId: wallet.taskerId };
}

export async function getWalletTransactions(walletId: string, params: { limit: number; offset: number }) {
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) throw new AppError('Wallet not found.', 404);

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.offset,
    }),
    prisma.walletTransaction.count({ where: { walletId } }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      description: t.description,
      referenceId: t.referenceId,
      createdAt: t.createdAt,
    })),
    total,
    wallet: {
      id: wallet.id,
      balance: Number(wallet.balance),
      availableBalance: Number(wallet.availableBalance),
      pendingBalance: Number(wallet.pendingBalance),
    },
  };
}

// ─── Notifications ──────────────────────────────────────

export async function sendNotification(userId: string, title: string, message: string) {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type: 'SYSTEM' },
  });
  return notification;
}

export async function broadcastNotification(title: string, message: string, roleFilter?: string) {
  const where: any = { deletedAt: null };
  if (roleFilter && roleFilter !== 'ALL') where.role = roleFilter;
  const users = await prisma.user.findMany({ where, select: { id: true } });
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, title, message, type: 'SYSTEM' as const })),
  });
  return { sentCount: users.length };
}

// ─── Targeted Notifications ─────────────────────────────

export async function sendTargetedNotification(userIds: string[], title: string, message: string) {
  const notifications = await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, title, message, type: 'SYSTEM' as const })),
  });
  return { sentCount: notifications.count };
}

// ─── Reports ────────────────────────────────────────────

export async function getRevenueReport(dateFrom?: string, dateTo?: string, groupBy = 'day') {
  const where: any = { paymentStatus: 'PAID' };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  const payments = await prisma.payment.findMany({
    where,
    select: { amount: true, platformFee: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const grouped = groupDataByPeriod(payments, groupBy);
  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalFees = payments.reduce((s, p) => s + Number(p.platformFee), 0);
  return { data: grouped, totalRevenue, totalFees, count: payments.length };
}

function groupDataByPeriod(data: any[], groupBy: string) {
  const map = new Map<string, { revenue: number; fees: number; count: number }>();
  for (const item of data) {
    const d = new Date(item.createdAt);
    let key: string;
    if (groupBy === 'month') key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    else if (groupBy === 'week') {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().slice(0, 10);
    } else key = d.toISOString().slice(0, 10);
    const entry = map.get(key) ?? { revenue: 0, fees: 0, count: 0 };
    entry.revenue += Number(item.amount);
    entry.fees += Number(item.platformFee ?? 0);
    entry.count++;
    map.set(key, entry);
  }
  return Array.from(map.entries()).map(([date, vals]) => ({ date, ...vals }));
}

export async function getUsersReport(dateFrom?: string, dateTo?: string) {
  const where: any = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  const users = await prisma.user.findMany({
    where,
    select: { role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const total = users.length;
  const customers = users.filter((u) => u.role === 'CUSTOMER').length;
  const taskers = users.filter((u) => u.role === 'TASKER').length;
  return { total, customers, taskers, data: users };
}

export async function getTasksReport(dateFrom?: string, dateTo?: string) {
  const where: any = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  const tasks = await prisma.task.findMany({ where, select: { status: true, createdAt: true } });
  const byStatus: Record<string, number> = {};
  for (const t of tasks) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
  }
  return { total: tasks.length, byStatus, data: tasks };
}

export async function getPaymentsReport(dateFrom?: string, dateTo?: string) {
  const where: any = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  const payments = await prisma.payment.findMany({
    where,
    select: { amount: true, platformFee: true, paymentStatus: true, createdAt: true },
  });
  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalFees = payments.reduce((s, p) => s + Number(p.platformFee), 0);
  return { total: payments.length, totalRevenue, totalFees };
}

// ─── Admin User Management ──────────────────────────────

export async function listAdminUsers() {
  return prisma.adminUser.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, email: true, role: true } },
      _count: { select: { auditLogs: true } },
    },
  });
}

export async function createAdminUser(userId: string, role: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);
  const existing = await prisma.adminUser.findUnique({ where: { userId } });
  if (existing) throw new AppError('User is already an admin.', 409);
  return prisma.adminUser.create({
    data: { userId, role: role as any },
    include: { user: { select: { firstName: true, lastName: true, phoneNumber: true, email: true } } },
  });
}

export async function updateAdminRole(adminUserId: string, role: string) {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
  if (!admin) throw new AppError('Admin user not found.', 404);
  return prisma.adminUser.update({
    where: { id: adminUserId },
    data: { role: role as any },
    include: { user: { select: { firstName: true, lastName: true, phoneNumber: true, email: true } } },
  });
}

export async function removeAdmin(adminUserId: string) {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
  if (!admin) throw new AppError('Admin user not found.', 404);
  if (admin.role === 'SUPER_ADMIN') throw new AppError('Cannot remove a SUPER_ADMIN.', 400);
  return prisma.adminUser.delete({ where: { id: adminUserId } });
}
