import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env';
import { AppError, JwtPayload } from '../types';

// ─── Augment Express Request with authenticated user ───
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Express middleware that authenticates requests using a JWT Bearer token.
 *
 * Expects the `Authorization` header in the format:
 *   Authorization: Bearer <token>
 *
 * On success, attaches the decoded `JwtPayload` to `req.user`.
 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Authentication required. No token provided.', 401);
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError(
      'Invalid authorization header format. Use: Bearer <token>',
      401,
    );
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new AppError('Invalid or expired token.', 401);
  }
};
