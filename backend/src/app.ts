import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { envConfig } from './config/env';
import { httpLogger } from './utils/logger';
import { AppError } from './types';
import routes from './routes';
import { notFoundHandler } from './middleware/notFound.middleware';
import { globalErrorHandler } from './middleware/error.middleware';

/**
 * Creates and configures the Express application.
 * Separated from the listener so it can be imported during testing.
 */
export function createApp(): express.Application {
  const app = express();

  // ── Security headers ────────────────────────────────
  app.use(helmet());

  // ── CORS ────────────────────────────────────────────
  app.use(
    cors({
      origin: envConfig.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  // ── Body parsing ────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Body guard: reject null/undefined bodies for mutation methods ──
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body === undefined) {
      return next(new AppError('Request body is required. Ensure Content-Type is application/json.', 400));
    }
    next();
  });

  // ── HTTP request logging ────────────────────────────
  app.use(httpLogger);

  // ── API routes (versioned) ──────────────────────────
  app.use('/api/v1', routes);

  // ── 404 handler (must be after routes) ──────────────
  app.use(notFoundHandler);

  // ── Global error handler (must be last) ─────────────
  app.use(globalErrorHandler);

  return app;
}
