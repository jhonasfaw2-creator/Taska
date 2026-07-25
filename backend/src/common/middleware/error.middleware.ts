import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ApiResponse } from '../types';
import { isProduction } from '../config/env';
import { logger } from '../utils/logger';

function buildErrorBody(error: string): ApiResponse {
  return { success: false, error };
}

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.requestId || 'unknown';
  const context = { requestId, path: req.path, method: req.method };

  logger.error(
    { ...context, err: err.message, stack: isProduction ? undefined : err.stack },
    'Unhandled error',
  );

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ ...buildErrorBody(err.message), requestId });
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    res.status(400).json({ ...buildErrorBody(`Validation failed: ${details}`), requestId });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ ...buildErrorBody('Invalid JSON in request body.'), requestId });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Database error.';
    let status = 400;

    if (err.code === 'P2002') {
      message = 'A record with that value already exists.';
      status = 409;
    } else if (err.code === 'P2025') {
      message = 'Record not found.';
      status = 404;
    } else if (err.code === 'P2003') {
      message = 'Referenced record does not exist.';
      status = 400;
    }

    res.status(status).json({ ...buildErrorBody(message), requestId });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res
      .status(400)
      .json({ ...buildErrorBody('Invalid data provided to the database.'), requestId });
    return;
  }

  const statusCode = 500;
  const errorMessage = isProduction ? 'Internal server error' : err.message;
  res.status(statusCode).json({ ...buildErrorBody(errorMessage), requestId });
};
