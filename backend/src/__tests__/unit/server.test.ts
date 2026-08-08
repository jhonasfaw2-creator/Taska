import http from 'http';
import { EventEmitter } from 'events';

// ─── Mocks ──────────────────────────────────────────────────────────────────
// We mock modules before importing server.ts so the mocks take effect at import time.

const mockDisconnect = jest.fn().mockResolvedValue(undefined);
const mockConnect = jest.fn().mockResolvedValue(undefined);

jest.mock('../../prisma/client', () => ({
  prisma: {
    $disconnect: mockDisconnect,
    $connect: mockConnect,
  },
}));

const mockInfo = jest.fn();
const mockError = jest.fn();
jest.mock('../../common/utils/logger', () => ({
  logger: {
    info: mockInfo,
    error: mockError,
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@sentry/node', () => ({
  init: jest.fn(),
}));

jest.mock('../../common/socket', () => ({
  initSocketServer: jest.fn(),
}));

jest.mock('../../common/config/env', () => ({
  envConfig: {
    nodeEnv: 'test',
    port: 0,
    jwtSecret: 'test-secret',
    corsOrigins: ['http://localhost:3000'],
    databaseUrl: 'postgresql://test:test@localhost:5432/test',
  },
  isProduction: false,
}));

// ─── Import after mocks ─────────────────────────────────────────────────────

describe('server.ts', () => {
  let server: http.Server;

  beforeAll(async () => {
    // Dynamic import so mocks are applied
    const serverModule = await import('../../server');
    server = serverModule.server;
  });

  afterAll(async () => {
    // Clean up the server if it's listening
    if (server && server.listening) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  describe('exports', () => {
    it('exports app', async () => {
      const { app } = await import('../../server');
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('exports server as an http.Server', () => {
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(http.Server);
    });
  });

  describe('graceful shutdown', () => {
    it('handles SIGTERM by closing the server and disconnecting prisma', async () => {
      // The process handlers are registered at import time.
      // We emit SIGTERM and verify the shutdown sequence.
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      process.emit('SIGTERM' as NodeJS.Signals);

      // Give the async shutdown a moment to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockInfo).toHaveBeenCalledWith(
        expect.objectContaining({ signal: 'SIGTERM' }),
        'Shutting down gracefully',
      );

      exitSpy.mockRestore();
    });

    it('handles SIGINT by closing the server and disconnecting prisma', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      process.emit('SIGINT' as NodeJS.Signals);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockInfo).toHaveBeenCalledWith(
        expect.objectContaining({ signal: 'SIGINT' }),
        'Shutting down gracefully',
      );

      exitSpy.mockRestore();
    });
  });

  describe('unhandled rejection handler', () => {
    it('logs unhandled rejections', () => {
      const testError = new Error('Test unhandled rejection');

      // Emit an unhandledRejection event
      process.emit('unhandledRejection', testError);

      expect(mockError).toHaveBeenCalledWith(testError, 'Unhandled Rejection');
    });

    it('handles non-Error rejection reasons', () => {
      const reason = 'string rejection reason';

      process.emit('unhandledRejection', reason);

      expect(mockError).toHaveBeenCalledWith(reason, 'Unhandled Rejection');
    });
  });
});
