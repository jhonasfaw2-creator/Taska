import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ApiResponse } from '../types';
import { isProduction } from '../config/env';
import { logger } from '../utils/logger';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = req.requestId || 'unknown';

  logger.error(
    {
      requestId,
      err: err.message,
      stack: isProduction ? undefined : err.stack,
      statusCode: err instanceof AppError ? err.statusCode : 500,
    },
    'Unhandled error',
  );

  if (err instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      error: err.message,
    };
    res.status(err.statusCode).json(body);
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

    const body: ApiResponse = { success: false, error: message };
    res.status(status).json(body);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    const body: ApiResponse = { success: false, error: 'Invalid data provided to the database.' };
    res.status(400).json(body);
    return;
  }

  const statusCode = 500;
  const body: ApiResponse = {
    success: false,
    error: isProduction ? 'Internal server error' : err.message,
  };
  res.status(statusCode).json(body);
};
