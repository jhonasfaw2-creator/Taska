import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { hasPermission, type Permission } from '../../modules/admin/permissions';

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }
    const userRole = req.user.adminRole || req.user.role;
    const allowed = permissions.some((p) => hasPermission(userRole, p));
    if (!allowed) {
      throw new AppError('Insufficient permissions.', 403);
    }
    next();
  };
}
