import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/errors';
import { prisma } from '../../prisma/client';
import * as matchingService from './matching.service';

export const getMatchingTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  if (req.user.role !== 'TASKER') {
    throw new AppError('Only taskers can search for matching tasks.', 403);
  }

  const profile = await prisma.taskerProfile.findUnique({
    where: { userId: req.user.userId },
    select: { id: true, verificationStatus: true, isOnline: true },
  });

  if (!profile) {
    throw new AppError('Tasker profile not found. Please apply first.', 404);
  }

  if (!profile.isOnline) {
    res.status(200).json({ success: true, data: [], message: 'Go online to find matching tasks.' });
    return;
  }

  const radiusKm = Math.min(Math.max(Number(req.query.radius) || 10, 1), 100);
  const vehicleType = typeof req.query.vehicleType === 'string' ? req.query.vehicleType : undefined;

  const tasks = await matchingService.findMatchingTasks({
    taskerProfileId: profile.id,
    radiusKm,
    vehicleType,
  });

  res.status(200).json({ success: true, data: tasks });
});

export const getMatchingTaskers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const { lat, lng, radius, vehicleType, categoryId } = req.query;

  if (!lat || !lng) {
    throw new AppError('lat and lng are required.', 400);
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  const radiusKm = Math.min(Math.max(Number(radius) || 10, 1), 100);

  const taskers = await matchingService.findMatchingTaskers({
    latitude,
    longitude,
    radiusKm,
    vehicleType: typeof vehicleType === 'string' ? vehicleType : undefined,
    categoryId: typeof categoryId === 'string' ? categoryId : undefined,
  });

  res.status(200).json({ success: true, data: taskers });
});
