import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/errors';
import * as userService from './user.service';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const profile = await userService.getProfile(req.user);

  res.status(200).json(profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const profile = await userService.updateProfile(req.user, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    profileImage: req.body.profileImage,
  });

  res.status(200).json(profile);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }

  const { role } = req.body;

  if (!role || typeof role !== 'string') {
    throw new AppError('Role is required.', 400);
  }

  const result = await userService.updateRole(req.user, role);

  res.status(200).json(result);
});
