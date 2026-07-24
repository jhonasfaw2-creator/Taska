import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/types';
import { prisma } from '../../prisma/client';
import * as taskerTasksService from './taskerTasks.service';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  if (req.user.role !== 'TASKER') {
    throw new AppError('Only taskers can view available tasks.', 403);
  }

  const profile = await prisma.taskerProfile.findUnique({
    where: { userId: req.user.userId },
    select: { id: true },
  });

  if (!profile) {
    throw new AppError('Tasker profile not found. Please apply first.', 404);
  }

  const tasks = await taskerTasksService.getAvailableTasks(profile.id);

  res.status(200).json(tasks);
});

export const getNearbyTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  if (req.user.role !== 'TASKER') {
    throw new AppError('Only taskers can view nearby tasks.', 403);
  }

  const profile = await prisma.taskerProfile.findUnique({
    where: { userId: req.user.userId },
    select: { id: true, userId: true, latitude: true, longitude: true },
  });

  if (!profile || !profile.latitude || !profile.longitude) {
    res
      .status(200)
      .json({ success: true, data: [], message: 'Enable location services to see nearby tasks.' });
    return;
  }

  const radiusKm = Number(req.query.radius || 10);
  const vehicleType = typeof req.query.vehicleType === 'string' ? req.query.vehicleType : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : 'SEARCHING';

  const tasks = await taskerTasksService.getNearbyTasksForTasker({
    taskerProfileId: profile.id,
    radiusKm,
    vehicleType,
    status,
  });

  res.status(200).json({ success: true, data: tasks });
});

export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  if (req.user.role !== 'TASKER') {
    throw new AppError('Only taskers can update location.', 403);
  }

  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new AppError('latitude and longitude are required numbers.', 400);
  }

  const profile = await prisma.taskerProfile.findUnique({
    where: { userId: req.user.userId },
    select: { id: true },
  });

  if (!profile) {
    throw new AppError('Tasker profile not found. Please apply first.', 404);
  }

  const result = await taskerTasksService.updateTaskerLocation(profile.id, latitude, longitude);

  res.status(200).json({ success: true, data: result });
});

export const acceptTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  if (req.user.role !== 'TASKER') {
    throw new AppError('Only taskers can accept tasks.', 403);
  }

  const profile = await prisma.taskerProfile.findUnique({
    where: { userId: req.user.userId },
    select: { id: true },
  });

  if (!profile) {
    throw new AppError('Tasker profile not found. Please apply first.', 404);
  }

  const taskId = req.params.taskId as string | undefined;

  if (!taskId) {
    throw new AppError('Task ID is required.', 400);
  }

  const result = await taskerTasksService.acceptTask(profile.id, taskId);

  res.status(200).json(result);
});
