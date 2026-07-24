import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { envConfig } from './common/config/env';
import { logger } from './common/utils/logger';
import { AppError } from './common/errors';
import { v1Router } from './modules/routes';
import { notFoundHandler } from './common/middleware/notFound.middleware';
import { globalErrorHandler } from './common/middleware/error.middleware';
import { requestIdMiddleware } from './common/middleware/requestId.middleware';
import { globalRateLimit, authRateLimit } from './common/middleware/rateLimiter.middleware';
import { securityErrorHandler } from './common/middleware/security.middleware';
import swaggerRouter from './docs/swagger';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: envConfig.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(requestIdMiddleware);

  app.use('/api/', globalRateLimit);
  app.use('/api/v1/auth', authRateLimit);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body === undefined) {
      return next(
        new AppError('Request body is required. Ensure Content-Type is application/json.', 400),
      );
    }
    next();
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const requestId = (req as Request & { requestId?: string }).requestId ?? 'unknown';
    logger.info({ requestId, method: req.method, url: req.url }, 'incoming request');
    next();
  });

  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.use('/api/v1', v1Router);
  app.use('/api/docs', swaggerRouter);

  app.use(notFoundHandler);
  app.use(securityErrorHandler);
  app.use(globalErrorHandler);

  return app;
}
