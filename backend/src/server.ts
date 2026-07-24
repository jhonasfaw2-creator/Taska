import http from 'http';
import * as Sentry from '@sentry/node';
import { createApp } from './app';
import { envConfig, isProduction } from './common/config/env';
import { logger } from './common/utils/logger';
import { prisma } from './prisma/client';
import { initSocketServer } from './common/socket';

if (isProduction && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: envConfig.nodeEnv,
    tracesSampleRate: 0.1,
  });
}

const app = createApp();
const server = http.createServer(app);

initSocketServer(server);

function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully');
  const forceShutdownTimer = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);

  forceShutdownTimer.unref();

  server.close(() => {
    clearTimeout(forceShutdownTimer);
    logger.info('HTTP server closed');
    prisma
      .$disconnect()
      .then(() => {
        logger.info('Database connections closed');
        process.exit(0);
      })
      .catch((err: unknown) => {
        logger.error(err as Error, 'Error during Prisma disconnect');
        process.exit(1);
      });
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(reason as Error, 'Unhandled Rejection');
});

async function verifyDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error(error as Error, 'Failed to connect to the database');
  }
}

server.listen(envConfig.port, async () => {
  await verifyDatabaseConnection();

  logger.info(
    {
      environment: envConfig.nodeEnv,
      port: envConfig.port,
      database: envConfig.databaseUrl ? 'configured' : 'NOT CONFIGURED',
    },
    'Server started',
  );
});

export { app, server };
