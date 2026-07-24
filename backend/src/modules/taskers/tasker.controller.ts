import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/types';
import * as taskerService from './tasker.service';
import { validateApply, validateStatus } from './tasker.validation';

export const apply = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const input = validateApply(req.body);

  const result = await taskerService.applyAsTasker({
    userId: req.user.userId,
    vehicleType: input.vehicleType,
    experience: input.experience,
    bio: input.bio,
  });

  res.status(201).json(result);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const profile = await taskerService.getProfile(req.user.userId);

  res.status(200).json(profile);
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const input = validateStatus(req.body);

  const profile = await taskerService.updateStatus({
    userId: req.user.userId,
    isOnline: input.isOnline,
  });

  res.status(200).json(profile);
});
