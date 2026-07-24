import { prisma } from '../../prisma/client';
import { envConfig } from '../../common/config/env';

const startTime = Date.now();

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: string;
  memory?: { rss: number; heapTotal: number; heapUsed: number };
}

export const getHealthStatus = async (): Promise<HealthStatus> => {
  let databaseStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'connected';
  } catch {
    databaseStatus = 'unreachable';
  }

  const status = databaseStatus === 'connected' ? 'ok' : 'degraded';

  return {
    status,
    service: 'Taska API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: envConfig.nodeEnv,
    database: databaseStatus,
    ...(envConfig.devMode ? { memory: process.memoryUsage() } : {}),
  };
};
