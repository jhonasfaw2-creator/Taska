import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const PROD_DB_URL = process.env.DATABASE_URL || '';
export const TEST_DB_URL = PROD_DB_URL.replace(/taska_dev$/, 'taska_test').replace(
  /taska_db\?/,
  'taska_test?',
);

export function setTestDatabaseUrl(): void {
  process.env.DATABASE_URL = TEST_DB_URL;
  const g = globalThis as unknown as { prisma?: PrismaClient };
  delete g.prisma;
}

export function createTestDatabase(): void {
  try {
    execSync(`createdb -U johannes taska_test 2>/dev/null || true`, {
      stdio: 'ignore',
    });
  } catch {
    // database may already exist
  }
  execSync('npx prisma db push --force-reset --accept-data-loss 2>&1', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
  });
}

let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      datasources: { db: { url: TEST_DB_URL } },
    });
  }
  return _prisma;
}

export async function resetDatabase(): Promise<void> {
  const p = getPrisma();
  const tables = await p.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

  for (const { tablename } of tables) {
    await p.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
  }
}

export async function closeDatabase(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
}
