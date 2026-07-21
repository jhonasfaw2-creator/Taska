// Load environment variables (incl. DATABASE_URL) before the client is
// instantiated. This is required for standalone scripts such as the seeder,
// which import this module directly without going through the server bootstrap.
import '../config/env';
import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client instance.
 *
 * In development, the client is cached on `globalThis` so hot-reloading
 * (nodemon / ts-node-dev) does not exhaust database connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
