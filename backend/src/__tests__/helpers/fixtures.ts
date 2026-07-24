import { PrismaClient, UserRole, TaskStatus, VehicleType } from '@prisma/client';
import { randomUUID } from 'crypto';

export function createTestUser(
  overrides: Partial<{
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
  }> = {},
) {
  const id = overrides.id || randomUUID();
  return {
    id,
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    phoneNumber:
      overrides.phoneNumber || `+2519${String(Math.floor(10000000 + Math.random() * 90000000))}`,
    role: overrides.role || UserRole.CUSTOMER,
  };
}

export function createTestCategory(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
  }> = {},
) {
  const name = overrides.name || `Category_${randomUUID().slice(0, 8)}`;
  return {
    id: overrides.id || randomUUID(),
    name,
    slug: overrides.slug || name.toLowerCase().replace(/\s+/g, '-'),
  };
}

export function createTestTask(
  overrides: Partial<{
    id: string;
    customerId: string;
    categoryId: string;
    title: string;
    status: TaskStatus;
    pickupLatitude: number;
    pickupLongitude: number;
    dropoffLatitude: number;
    dropoffLongitude: number;
    estimatedPrice: number;
    vehicleType: VehicleType;
  }> = {},
) {
  return {
    id: overrides.id || randomUUID(),
    customerId: overrides.customerId || randomUUID(),
    categoryId: overrides.categoryId || randomUUID(),
    title: overrides.title || 'Test Task',
    description: 'A test task description',
    pickupAddress: '123 Test St',
    pickupLatitude: overrides.pickupLatitude ?? 9.0227,
    pickupLongitude: overrides.pickupLongitude ?? 38.7468,
    dropoffAddress: '456 Test Ave',
    dropoffLatitude: overrides.dropoffLatitude ?? 9.0082,
    dropoffLongitude: overrides.dropoffLongitude ?? 38.7614,
    vehicleType: overrides.vehicleType || VehicleType.MOTORCYCLE,
    estimatedPrice: overrides.estimatedPrice ?? 150.0,
    status: overrides.status || TaskStatus.PENDING,
  };
}

export async function seedCategory(prisma: PrismaClient, overrides = {}) {
  const data = createTestCategory(overrides);
  return prisma.category.create({ data });
}

export async function seedUser(prisma: PrismaClient, overrides = {}) {
  const data = createTestUser(overrides);
  return prisma.user.create({ data });
}

export async function seedCustomer(prisma: PrismaClient, overrides = {}) {
  return seedUser(prisma, { ...overrides, role: UserRole.CUSTOMER });
}

export async function seedTaskerUser(prisma: PrismaClient, overrides = {}) {
  return seedUser(prisma, { ...overrides, role: UserRole.TASKER });
}

export async function seedTaskerProfile(
  prisma: PrismaClient,
  userId: string,
  overrides: Partial<{
    isOnline: boolean;
    bio: string;
    experience: number;
  }> = {},
) {
  return prisma.taskerProfile.create({
    data: {
      userId,
      isOnline: overrides.isOnline ?? true,
      bio: overrides.bio ?? 'Test tasker',
      experience: overrides.experience ?? 2,
    },
  });
}

export async function seedTask(
  prisma: PrismaClient,
  overrides: Parameters<typeof createTestTask>[0] & {
    customerId: string;
    categoryId: string;
  },
) {
  const data = createTestTask(overrides);
  return prisma.task.create({ data });
}

export async function seedTaskOffer(
  prisma: PrismaClient,
  taskId: string,
  taskerId: string,
  overrides: Partial<{ price: number; status: string }> = {},
) {
  return prisma.taskOffer.create({
    data: {
      taskId,
      taskerId,
      price: overrides.price ?? 140.0,
      status: (overrides.status as any) ?? 'PENDING',
    },
  });
}

export async function seedNotification(
  prisma: PrismaClient,
  userId: string,
  overrides: Partial<{
    title: string;
    message: string;
    type: string;
  }> = {},
) {
  return prisma.notification.create({
    data: {
      userId,
      title: overrides.title || 'Test Notification',
      message: overrides.message || 'This is a test notification',
      type: (overrides.type as any) || 'SYSTEM',
    },
  });
}

export async function seedWallet(
  prisma: PrismaClient,
  taskerId: string,
  overrides: Partial<{ balance: number; totalEarned: number }> = {},
) {
  return prisma.wallet.create({
    data: {
      taskerId,
      balance: overrides.balance ?? 1000.0,
      totalEarned: overrides.totalEarned ?? 2000.0,
    },
  });
}

export async function seedReview(
  prisma: PrismaClient,
  overrides: {
    taskId: string;
    reviewerId: string;
    reviewedUserId: string;
    rating?: number;
  },
) {
  return prisma.review.create({
    data: {
      taskId: overrides.taskId,
      reviewerId: overrides.reviewerId,
      reviewedUserId: overrides.reviewedUserId,
      rating: overrides.rating ?? 5,
    },
  });
}

export async function seedAdminUser(
  prisma: PrismaClient,
  userId: string,
  overrides: Partial<{ role: string }> = {},
) {
  return prisma.adminUser.create({
    data: {
      userId,
      role: (overrides.role as any) || 'ADMIN',
    },
  });
}
