import dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from '../types';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) {
    return ['http://localhost:3000'];
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

function getPort(): number {
  const port = parseInt(process.env.PORT || '5000', 10);
  return Number.isFinite(port) ? port : 5000;
}

function getJwtSecret(key: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const secret = process.env[key];
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error(`${key} environment variable is required in production`);
  }
  // Deterministic dev-only fallback — never use in production
  const devFallbacks: Record<string, string> = {
    JWT_SECRET: 'taska-dev-jwt-secret-do-not-use-in-production',
    JWT_REFRESH_SECRET: 'taska-dev-jwt-refresh-secret-do-not-use-in-production',
  };
  return secret || devFallbacks[key];
}

export const envConfig: EnvConfig = {
  port: getPort(),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  corsOrigins: getCorsOrigins(),
  logFormat: process.env.LOG_FORMAT || 'dev',
  jwtSecret: getJwtSecret('JWT_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  devMode: process.env.DEV_MODE === 'true' || process.env.NODE_ENV !== 'production',
} as const;

export const isProduction = envConfig.nodeEnv === 'production';
export const isDevelopment = envConfig.nodeEnv === 'development';
export const isTest = envConfig.nodeEnv === 'test';
