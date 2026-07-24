import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/errors';
import * as taskService from './task.service';
import { validateCreateTask } from './task.validation';

export const getRecentTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const tasks = await taskService.getRecentTasksByCustomer(req.user.userId);
  res.status(200).json(tasks);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  if (req.user.role !== 'CUSTOMER') {
    throw new AppError('Only customers can create tasks.', 403);
  }

  const input = validateCreateTask(req.body);

  const task = await taskService.createTask(req.user.userId, input);

  res.status(201).json(task);
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const taskId = req.params.taskId as string;
  if (!taskId) {
    throw new AppError('Task ID is required.', 400);
  }

  const task = await taskService.getTaskById(taskId);

  res.status(200).json(task);
});

export const getMyTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const tasks = await taskService.getMyTasks(req.user.userId);

  res.status(200).json(tasks);
});
