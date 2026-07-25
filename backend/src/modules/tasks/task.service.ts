import { prisma } from '../../prisma/client';
import { AppError } from '../../common/types';
import { logger } from '../../common/utils/logger';
import type { VehicleType } from '@prisma/client';
import type { CreateTaskInput } from './task.validation';
import { emitToUser } from '../../common/socket';

export interface TaskResult {
  id: string;
  customerId: string;
  categoryId: string;
  title: string;
  description: string;
  specialInstructions: string | null;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  vehicleType: string;
  estimatedPrice: number;
  finalPrice: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyTaskResult {
  id: string;
  title: string;
  description: string;
  status: string;
  estimatedPrice: number;
  finalPrice: number | null;
  vehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  createdAt: string;
  categoryName: string;
}

export interface RecentTaskResult {
  id: string;
  title: string;
  status: string;
  estimatedPrice: number;
  finalPrice: number | null;
  createdAt: string;
  categoryName: string;
}

function mapTaskToResult(task: any): TaskResult {
  return {
    id: task.id,
    customerId: task.customerId,
    categoryId: task.categoryId,
    title: task.title,
    description: task.description,
    specialInstructions: task.specialInstructions,
    pickupAddress: task.pickupAddress,
    pickupLatitude: Number(task.pickupLatitude),
    pickupLongitude: Number(task.pickupLongitude),
    dropoffAddress: task.dropoffAddress,
    dropoffLatitude: Number(task.dropoffLatitude),
    dropoffLongitude: Number(task.dropoffLongitude),
    vehicleType: task.vehicleType,
    estimatedPrice: Number(task.estimatedPrice),
    finalPrice: task.finalPrice ? Number(task.finalPrice) : null,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function createTask(customerId: string, input: CreateTaskInput): Promise<TaskResult> {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });
  if (!category) {
    throw new AppError('Invalid categoryId. Category not found.', 400);
  }

  const task = await prisma.task.create({
    data: {
      customerId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      specialInstructions: input.specialInstructions ?? null,
      pickupAddress: input.pickupAddress,
      pickupLatitude: input.pickupLatitude,
      pickupLongitude: input.pickupLongitude,
      dropoffAddress: input.dropoffAddress,
      dropoffLatitude: input.dropoffLatitude,
      dropoffLongitude: input.dropoffLongitude,
      vehicleType: input.vehicleType as VehicleType,
      estimatedPrice: input.estimatedPrice,
      status: 'PENDING',
      statusHistory: {
        create: {
          status: 'PENDING',
          changedBy: customerId,
        },
      },
      images:
        input.imageUrls && input.imageUrls.length > 0
          ? {
              create: input.imageUrls.map((url) => ({
                imageUrl: url,
              })),
            }
          : undefined,
    },
  
  });

  try {
    emitToUser(customerId, {
      event: 'task_created',
      taskId: task.id,
      title: task.title,
    });
  } catch (err) {
    logger.error(err as Error, 'Socket emit failed: task_created');
  }

  return mapTaskToResult(task);
}

export async function getTaskById(taskId: string): Promise<TaskResult & { categoryName: string }> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { category: { select: { name: true } } },
  });

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  return {
    ...mapTaskToResult(task),
    categoryName: task.category.name,
  };
}

export async function getMyTasks(customerId: string): Promise<MyTaskResult[]> {
  const tasks = await prisma.task.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      estimatedPrice: true,
      finalPrice: true,
      vehicleType: true,
      pickupAddress: true,
      dropoffAddress: true,
      createdAt: true,
      category: {
        select: { name: true },
      },
    },
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    estimatedPrice: Number(t.estimatedPrice),
    finalPrice: t.finalPrice ? Number(t.finalPrice) : null,
    vehicleType: t.vehicleType,
    pickupAddress: t.pickupAddress,
    dropoffAddress: t.dropoffAddress,
    createdAt: t.createdAt.toISOString(),
    categoryName: t.category.name,
  }));
}

export async function getRecentTasksByCustomer(
  customerId: string,
  limit = 10,
): Promise<RecentTaskResult[]> {
  const tasks = await prisma.task.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      estimatedPrice: true,
      finalPrice: true,
      createdAt: true,
      category: {
        select: { name: true },
      },
    },
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    estimatedPrice: Number(t.estimatedPrice),
    finalPrice: t.finalPrice ? Number(t.finalPrice) : null,
    createdAt: t.createdAt.toISOString(),
    categoryName: t.category.name,
  }));
}
