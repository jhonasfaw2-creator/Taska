import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AppError('Authentication required.', 401);
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError('Admin access required.', 403);
  }
  next();
};
