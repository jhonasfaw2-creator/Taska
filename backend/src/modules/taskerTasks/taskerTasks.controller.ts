import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../types';
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
