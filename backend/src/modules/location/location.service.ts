import { prisma } from '../../prisma/client';
import { AppError } from '../../common/errors';
import type { VehicleType } from '@prisma/client';

const EARTH_RADIUS_KM = 6371;

export function validateCoordinates(latitude: number, longitude: number): void {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new AppError('Coordinates must be valid numbers.', 400);
  }
  if (latitude < -90 || latitude > 90) {
    throw new AppError('Latitude must be between -90 and 90.', 400);
  }
  if (longitude < -180 || longitude > 180) {
    throw new AppError('Longitude must be between -180 and 180.', 400);
  }
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export interface NearbyTaskerOptions {
  latitude: number;
  longitude: number;
  radiusKm: number;
  vehicleType?: string;
}

export interface NearbyTaskOptions {
  latitude: number;
  longitude: number;
  radiusKm: number;
  vehicleType?: string;
  status?: string;
}

export async function findNearbyTaskers(options: NearbyTaskerOptions) {
  const { latitude, longitude, radiusKm, vehicleType } = options;

  validateCoordinates(latitude, longitude);

  const taskers = await prisma.taskerProfile.findMany({
    where: {
      isOnline: true,
      verificationStatus: 'APPROVED',
      ...(vehicleType
        ? { vehicles: { some: { type: vehicleType as VehicleType, isApproved: true } } }
        : {}),
    },
    select: {
      id: true,
      userId: true,
      latitude: true,
      longitude: true,
      verificationStatus: true,
      isOnline: true,
      rating: true,
      totalTasksCompleted: true,
      bio: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      vehicles: {
        where: { isApproved: true },
        select: {
          id: true,
          type: true,
          licensePlate: true,
          color: true,
        },
      },
    },
  });

  const taskersWithDistance = taskers
    .map((tasker) => {
      if (tasker.latitude == null || tasker.longitude == null) return null;
      const distance = haversineDistance(latitude, longitude, tasker.latitude, tasker.longitude);
      return { ...tasker, distance };
    })
    .filter(
      (tasker): tasker is NonNullable<typeof tasker> =>
        tasker !== null && tasker.distance <= radiusKm,
    )
    .sort((a, b) => a.distance - b.distance);

  return taskersWithDistance;
}

export async function findNearbyTasks(options: NearbyTaskOptions) {
  const { latitude, longitude, radiusKm, vehicleType, status } = options;

  validateCoordinates(latitude, longitude);

  const tasks = await prisma.task.findMany({
    where: {
      status: status ? (status as any) : 'SEARCHING',
      taskerId: null,
      ...(vehicleType ? { vehicleType: vehicleType as VehicleType } : {}),
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          iconUrl: true,
        },
      },
      images: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const tasksWithDistance = tasks
    .map((task) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        Number(task.pickupLatitude),
        Number(task.pickupLongitude),
      );
      return { ...task, distance };
    })
    .filter((task) => task.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return tasksWithDistance;
}
