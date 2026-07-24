import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { prisma } from '../../prisma/client';

/**
 * Logs security-relevant events like permission denied and authentication failures.
 * This works alongside the audit log system to track all admin security events.
 */
export async function logSecurityEvent(
  adminId: string | undefined,
  action: string,
  details: Record<string, unknown>,
  ipAddress?: string,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType: 'security',
        entityId: 'system',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changes: details as any,
        ipAddress,
      },
    });
  } catch {
    // Silently fail - we don't want security logging to break requests
  }
}

/**
 * Middleware that catches AppError and logs permission-denied events.
 * Attaches to the error handler chain.
 */
export function securityErrorHandler(
  err: Error,
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (err instanceof AppError && err.statusCode === 403) {
    const action =
      err.message === 'Admin access required.' ? 'admin_access_denied' : 'permission_denied';

    logSecurityEvent(
      req.user?.userId,
      action,
      {
        path: req.path,
        method: req.method,
        role: req.user?.role,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        adminRole: (req.user as any)?.adminRole,
        message: err.message,
      },
      req.ip,
    ).catch(() => {});
  }

  if (err instanceof AppError && err.statusCode === 401) {
    logSecurityEvent(
      undefined,
      'auth_failure',
      {
        path: req.path,
        method: req.method,
        message: err.message,
      },
      req.ip,
    ).catch(() => {});
  }

  next(err);
}

/**
 * Log failed login attempts to security audit log.
 */
export async function logFailedLogin(
  phoneNumber: string,
  reason: string,
  ipAddress?: string,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: null,
        action: 'login_failed',
        entityType: 'security',
        entityId: 'auth',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changes: { phoneNumber, reason } as any,
        ipAddress,
      },
    });
  } catch {
    // Silently fail
  }
}
