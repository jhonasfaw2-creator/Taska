import { prisma } from '../../prisma/client';
import { AppError } from '../../common/errors';
import { validateCoordinates, haversineDistance } from '../location/location.service';
import type { VehicleType } from '@prisma/client';

export interface MatchTaskOptions {
  taskerProfileId: string;
  radiusKm: number;
  vehicleType?: string;
}

export interface MatchTaskerOptions {
  latitude: number;
  longitude: number;
  radiusKm: number;
  vehicleType?: string;
  categoryId?: string;
}

export interface MatchResult {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  estimatedPrice: number;
  distanceKm: number;
  customerRating: number | null;
  status: string;
  createdAt: string;
}

export interface TaskerMatchResult {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  rating: number;
  totalTasksCompleted: number;
  distance: number;
  vehicleTypes: string[];
  isOnline: boolean;
  verificationStatus: string;
}

export async function findMatchingTasks(options: MatchTaskOptions): Promise<MatchResult[]> {
  const { taskerProfileId, radiusKm, vehicleType } = options;

  const profile = await prisma.taskerProfile.findUnique({
    where: { id: taskerProfileId },
    select: {
      latitude: true,
      longitude: true,
      verificationStatus: true,
      isOnline: true,
      userId: true,
    },
  });

  if (!profile || !profile.latitude || !profile.longitude) {
    return [];
  }

  if (profile.verificationStatus !== 'APPROVED') {
    throw new AppError('Your profile must be verified to search for tasks.', 403);
  }

  validateCoordinates(profile.latitude, profile.longitude);

  const tasks = await prisma.task.findMany({
    where: {
      status: 'SEARCHING',
      taskerId: null,
      customerId: { not: profile.userId },
      ...(vehicleType ? { vehicleType: vehicleType as VehicleType } : {}),
    },
    include: {
      customer: {
        select: {
          ratingSummary: {
            select: { averageRating: true },
          },
        },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return tasks
    .map((task) => {
      const distance = haversineDistance(
        profile.latitude!,
        profile.longitude!,
        Number(task.pickupLatitude),
        Number(task.pickupLongitude),
      );
      const avgRating = task.customer.ratingSummary?.averageRating
        ? Number(task.customer.ratingSummary.averageRating)
        : null;

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        categoryName: task.category.name,
        pickupAddress: task.pickupAddress,
        pickupLatitude: Number(task.pickupLatitude),
        pickupLongitude: Number(task.pickupLongitude),
        dropoffAddress: task.dropoffAddress,
        dropoffLatitude: Number(task.dropoffLatitude),
        dropoffLongitude: Number(task.dropoffLongitude),
        estimatedPrice: Number(task.estimatedPrice),
        distanceKm: Math.round(distance * 10) / 10,
        customerRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        status: task.status,
        createdAt: task.createdAt.toISOString(),
      };
    })
    .filter((task) => task.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function findMatchingTaskers(
  options: MatchTaskerOptions,
): Promise<TaskerMatchResult[]> {
  const { latitude, longitude, radiusKm, vehicleType } = options;

  validateCoordinates(latitude, longitude);

  const taskers = await prisma.taskerProfile.findMany({
    where: {
      isOnline: true,
      verificationStatus: 'APPROVED',
      latitude: { not: null },
      longitude: { not: null },
      ...(vehicleType
        ? { vehicles: { some: { type: vehicleType as VehicleType, isApproved: true } } }
        : {}),
    },
    select: {
      id: true,
      userId: true,
      latitude: true,
      longitude: true,
      rating: true,
      totalTasksCompleted: true,
      isOnline: true,
      verificationStatus: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      vehicles: {
        where: { isApproved: true },
        select: { type: true },
      },
    },
  });

  return taskers
    .map((tasker) => {
      const distance = haversineDistance(latitude, longitude, tasker.latitude!, tasker.longitude!);
      return {
        id: tasker.id,
        userId: tasker.userId,
        firstName: tasker.user.firstName ?? '',
        lastName: tasker.user.lastName ?? '',
        rating: tasker.rating,
        totalTasksCompleted: tasker.totalTasksCompleted,
        distance: Math.round(distance * 10) / 10,
        vehicleTypes: tasker.vehicles.map((v) => v.type),
        isOnline: tasker.isOnline,
        verificationStatus: tasker.verificationStatus,
      };
    })
    .filter((tasker) => tasker.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
