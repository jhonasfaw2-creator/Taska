import jwt from 'jsonwebtoken';
import { envConfig } from '../../common/config/env';

export function generateTestToken(
  overrides: Partial<{
    userId: string;
    phoneNumber: string;
    role: string;
    adminRole?: string;
  }> = {},
): string {
  const payload: Record<string, string> = {
    userId: overrides.userId || '00000000-0000-0000-0000-000000000000',
    phoneNumber: overrides.phoneNumber || '+251911000000',
    role: overrides.role || 'CUSTOMER',
  };
  if (overrides.adminRole) {
    payload.adminRole = overrides.adminRole;
  }
  return jwt.sign(payload, envConfig.jwtSecret, { expiresIn: '1h' });
}

export function generateExpiredToken(): string {
  const payload = {
    userId: '00000000-0000-0000-0000-000000000000',
    phoneNumber: '+251911000000',
    role: 'CUSTOMER',
  };
  return jwt.sign(payload, envConfig.jwtSecret, { expiresIn: '0s' });
}
