import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../types';
import * as notificationService from './notification.service';

export const registerDevice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const { pushToken, platform } = req.body;

  if (!pushToken || typeof pushToken !== 'string') {
    throw new AppError('pushToken is required and must be a string.', 400);
  }
  if (!platform || typeof platform !== 'string') {
    throw new AppError('platform is required and must be a string.', 400);
  }

  const result = await notificationService.registerDevice(req.user.userId, pushToken, platform);

  res.status(200).json(result);
});

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const notifications = await notificationService.getNotifications(req.user.userId);

  res.status(200).json(notifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    throw new AppError('Notification ID is required.', 400);
  }

  const notification = await notificationService.markAsRead(id, req.user.userId);

  res.status(200).json(notification);
});
