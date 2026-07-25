import { PrismaClient } from '@prisma/client';
import { perf } from '../common/utils/perf';
import { logger } from '../common/utils/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

const extended = prismaClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const duration = Date.now() - start;
        perf.recordQuery(model, operation, duration);
        if (duration > 1000) {
          logger.warn({ model, operation, duration }, 'slow database query');
        }
        return result;
      },
    },
  },
});

export const prisma = extended;
