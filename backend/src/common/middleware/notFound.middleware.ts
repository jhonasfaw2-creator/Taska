import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * 404 handler — must be registered AFTER all other routes.
 * Passes an AppError to the global error middleware.
 */
export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError('Resource not found', 404));
};
