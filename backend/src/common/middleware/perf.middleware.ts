import { Request, Response, NextFunction } from 'express';
import { perf } from '../utils/perf';

function routePattern(req: Request): string {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}`.replace(/\/$/, '') || '/';
  }
  return req.path;
}

export function perfMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    perf.recordRequest(req.method, routePattern(req), duration, res.statusCode);
  });

  next();
}
