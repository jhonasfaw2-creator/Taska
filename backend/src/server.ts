import http from 'http';
import { createApp } from './app';
import { envConfig } from './config/env';
import { prisma } from './prisma/client';
import { initSocketServer } from './services/socket.service';

const app = createApp();
const server = http.createServer(app);

// ── Attach Socket.IO to the HTTP server ──────────────
initSocketServer(server);

/**
 * Attempt a graceful shutdown — close the HTTP server first,
 * then disconnect Prisma so the pool releases connections.
 */
function gracefulShutdown(signal: string) {
  console.log(`\n[server] Received ${signal}. Shutting down gracefully…`);
  server.close(() => {
    console.log('[server] HTTP server closed.');
    prisma
      .$disconnect()
      .then(() => {
        console.log('[server] Database connections closed.');
        process.exit(0);
      })
      .catch((err: unknown) => {
        console.error('[server] Error during Prisma disconnect:', err);
        process.exit(1);
      });
  });
}

// ── Register OS signal handlers ─────────────────────────
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Unhandled rejections should not be swallowed ────────
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled Rejection:', reason);
});

// ── Verify database connectivity ───────────────────────
async function verifyDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('[server] Database connected successfully.');
  } catch (error) {
    console.error('[server] Failed to connect to the database.');
    console.error('[server]   Ensure PostgreSQL is running.');
    console.error('[server]   Ensure DATABASE_URL in backend/.env is correct.');
    console.error('[server]   Run:  sudo bash backend/scripts/setup-db.sh');
    console.error('[server] Error:', (error as Error).message);
    // Don't crash — the health endpoint works without DB, and
    // the error middleware will surface DB errors when endpoints try to use it.
  }
}

// ── Start listening ─────────────────────────────────────
server.listen(envConfig.port, async () => {
  await verifyDatabaseConnection();

  console.log(`
╔══════════════════════════════════════════════════════╗
║  Taska API                                          ║
║  Environment : ${envConfig.nodeEnv.padEnd(35)}║
║  Listening   : http://localhost:${String(envConfig.port).padEnd(28)}║
║  WebSocket   : ws://localhost:${String(envConfig.port).padEnd(23)}║
║  Health      : http://localhost:${String(envConfig.port)}/api/v1/health  ║
║  Database    : ${envConfig.databaseUrl ? 'configured' : 'NOT CONFIGURED'.padEnd(20)}║
╚══════════════════════════════════════════════════════╝
  `);
});

export { app, server };
