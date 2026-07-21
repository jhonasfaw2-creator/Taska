import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../types';
import * as taskService from '../services/task.service';

export const getRecentTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const tasks = await taskService.getRecentTasksByCustomer(req.user.userId);
  res.status(200).json(tasks);
});
