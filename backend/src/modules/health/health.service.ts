import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { envConfig } from '../../common/config/env';
import { logger } from '../../common/utils/logger';
import { perf } from '../../common/utils/perf';

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: { status: string; latencyMs: number };
  prisma: { status: string; version: string };
  memory: { rss: number; heapTotal: number; heapUsed: number; external: number };
  performance: {
    totalRequests: number;
    routes: { route: string; count: number; avgMs: number; maxMs: number }[];
    windowSeconds: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../../package.json');

export const getHealthStatus = async (): Promise<HealthStatus> => {
  const memory = process.memoryUsage();
  let dbLatency = 0;
  let dbStatus = 'disconnected';

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - start;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'unreachable';
    logger.error(err as Error, 'Health check — database unreachable');
  }

  const prismaStatus = dbStatus === 'connected' ? 'ready' : 'unavailable';

  const allHealthy = dbStatus === 'connected';
  const status = allHealthy ? 'ok' : 'degraded';

  const metrics = perf.getMetrics();

  return {
    status,
    service: 'Taska API',
    version,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: envConfig.nodeEnv,
    database: { status: dbStatus, latencyMs: dbLatency },
    prisma: { status: prismaStatus, version: Prisma.prismaVersion.client },
    memory: {
      rss: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
    },
    performance: {
      totalRequests: metrics.totalRequests,
      routes: metrics.routes.map((r) => ({
        route: r.route,
        count: r.count,
        avgMs: r.avgMs,
        maxMs: r.maxMs,
      })),
      windowSeconds: metrics.windowSeconds,
    },
  };
};
