import { prisma } from '../../prisma/client';
import { AppError } from '../../common/types';
import type { VehicleType } from '@prisma/client';

export interface TaskerProfileResult {
  id: string;
  userId: string;
  verificationStatus: string;
  rating: number;
  totalTasksCompleted: number;
  isOnline: boolean;
  bio: string | null;
  experience: number | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApplyParams {
  userId: string;
  vehicleType: string;
  experience?: number;
  bio?: string;
}

interface StatusParams {
  userId: string;
  isOnline: boolean;
}

function mapProfile(profile: any): TaskerProfileResult {
  return {
    id: profile.id,
    userId: profile.userId,
    verificationStatus: profile.verificationStatus,
    rating: profile.rating,
    totalTasksCompleted: profile.totalTasksCompleted,
    isOnline: profile.isOnline,
    bio: profile.bio,
    experience: profile.experience,
    lastActiveAt: profile.lastActiveAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function applyAsTasker(params: ApplyParams): Promise<{
  message: string;
  taskerProfile: TaskerProfileResult;
}> {
  const existing = await prisma.taskerProfile.findUnique({
    where: { userId: params.userId },
  });

  if (existing) {
    throw new AppError('You have already applied to become a tasker.', 409);
  }

  const profile = await prisma.taskerProfile.create({
    data: {
      userId: params.userId,
      bio: params.bio ?? null,
      experience: params.experience ?? null,
      verificationStatus: 'PENDING',
      vehicles: {
        create: {
          type: params.vehicleType as VehicleType,
        },
      },
    },
    include: { vehicles: true },
  });

  await prisma.user.update({
    where: { id: params.userId },
    data: { role: 'TASKER' },
  });

  return {
    message: 'Tasker application submitted',
    taskerProfile: mapProfile(profile),
  };
}

export async function getProfile(userId: string): Promise<TaskerProfileResult> {
  const profile = await prisma.taskerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError('Tasker profile not found. Please apply first.', 404);
  }

  return mapProfile(profile);
}

export async function updateStatus(params: StatusParams): Promise<TaskerProfileResult> {
  const profile = await prisma.taskerProfile.findUnique({
    where: { userId: params.userId },
  });

  if (!profile) {
    throw new AppError('Tasker profile not found. Please apply first.', 404);
  }

  const updated = await prisma.taskerProfile.update({
    where: { userId: params.userId },
    data: {
      isOnline: params.isOnline,
      lastActiveAt: params.isOnline ? new Date() : undefined,
    },
  });

  return mapProfile(updated);
}
