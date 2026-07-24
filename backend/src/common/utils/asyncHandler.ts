import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express request handler so that any thrown / rejected
 * promise is automatically forwarded to the global error middleware
 * via `next(err)`.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res, next) => { … }));
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
