import { Request, Response, NextFunction } from 'express';
import { perf } from '../utils/perf';

export function perfMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    perf.recordRequest(req.method, req.path, duration, res.statusCode);
  });

  next();
}
