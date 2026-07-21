import { Request, Response } from 'express';
import { AppError } from '../types';

/**
 * 404 handler — must be registered AFTER all other routes.
 * Throws an AppError so the global error middleware picks it up.
 */
export const notFoundHandler = (_req: Request, _res: Response): void => {
  throw new AppError('Resource not found', 404);
};
