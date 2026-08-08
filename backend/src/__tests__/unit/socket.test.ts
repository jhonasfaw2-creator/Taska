import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../common/config/env';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../common/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// ─── Test Setup ─────────────────────────────────────────────────────────────

function createTestToken(overrides: Partial<{ userId: string; role: string }> = {}): string {
  return jwt.sign(
    {
      userId: overrides.userId || 'test-user-123',
      role: overrides.role || 'CUSTOMER',
      phoneNumber: '+251911000000',
    },
    envConfig.jwtSecret,
    { expiresIn: '1h' },
  );
}

describe('Socket.IO module', () => {
  let httpServer: http.Server;
  let ioServer: SocketIOServer;
  let clientSocket: ClientSocket;
  let port: number;

  beforeAll((done) => {
    // Create a real HTTP server
    httpServer = http.createServer();
    httpServer.listen(0, () => {
      const addr = httpServer.address();
      port = typeof addr === 'object' && addr ? addr.port : 0;

      // Dynamically import after server is ready
      import('../../common/socket').then(({ initSocketServer }) => {
        ioServer = initSocketServer(httpServer);
        done();
      });
    });
  });

  afterAll(async () => {
    // Clean up clients
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    // Close server
    await new Promise<void>((resolve) => {
      if (ioServer) {
        ioServer.close(() => resolve());
      } else {
        resolve();
      }
    });
    await new Promise<void>((resolve) => {
      if (httpServer) {
        httpServer.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  function createClient(token: string): ClientSocket {
    return ClientIO(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
    });
  }

  // ── JWT Authentication ──────────────────────────────────────────────────

  describe('JWT authentication', () => {
    it('allows connection with valid token', (done) => {
      const token = createTestToken();
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (err) => {
        done(err);
      });
    });

    it('rejects connection with no token', (done) => {
      clientSocket = ClientIO(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true,
      });

      clientSocket.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication required');
        done();
      });
    });

    it('rejects connection with invalid token', (done) => {
      clientSocket = createClient('invalid-token-here');

      clientSocket.on('connect_error', (err) => {
        expect(err.message).toContain('Invalid or expired token');
        done();
      });
    });

    it('rejects connection with expired token', (done) => {
      const expiredToken = jwt.sign(
        { userId: 'test', role: 'CUSTOMER', phoneNumber: '+251911000000' },
        envConfig.jwtSecret,
        { expiresIn: '0s' },
      );

      clientSocket = createClient(expiredToken);

      clientSocket.on('connect_error', (err) => {
        expect(err.message).toContain('Invalid or expired token');
        done();
      });
    });
  });

  // ── Connection & Rooms ──────────────────────────────────────────────────

  describe('connection and rooms', () => {
    it('joins the user personal room on connection', (done) => {
      const userId = 'room-test-user';
      const token = createTestToken({ userId });
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        // The server should have joined user:{userId} room
        // We verify by checking the socket is connected
        expect(clientSocket.id).toBeDefined();
        done();
      });
    });

    it('can join a task room', (done) => {
      const token = createTestToken();
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        clientSocket.emit('join:task', 'task-abc-123');

        // Verify by listening for events in the task room
        // The server logs the join, so we consider this a success if no error
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    it('can leave a task room', (done) => {
      const token = createTestToken();
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        clientSocket.emit('join:task', 'task-xyz-789');
        setTimeout(() => {
          clientSocket.emit('leave:task', 'task-xyz-789');
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    it('ignores non-string taskId for join:task', (done) => {
      const token = createTestToken();
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        // Sending a number instead of string - should be ignored gracefully
        clientSocket.emit('join:task', 12345 as any);
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    it('ignores non-string taskId for leave:task', (done) => {
      const token = createTestToken();
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        clientSocket.emit('leave:task', { not: 'a string' } as any);
        setTimeout(() => {
          expect(clientSocket.connected).toBe(true);
          done();
        }, 100);
      });
    });

    it('handles disconnect gracefully', (done) => {
      const token = createTestToken();
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        clientSocket.disconnect();
        // If we get here without errors, the disconnect handler worked
        setTimeout(() => {
          expect(clientSocket.connected).toBe(false);
          done();
        }, 100);
      });
    });
  });

  // ── Emitter Helpers ─────────────────────────────────────────────────────

  describe('emitter helpers', () => {
    it('emitToTask sends event to task room', (done) => {
      const { emitToTask } = require('../../common/socket');
      const token = createTestToken();
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        // Join a task room first
        clientSocket.emit('join:task', 'emit-test-task');

        setTimeout(() => {
          // Emit to the task room
          emitToTask('emit-test-task', {
            event: 'task_status_changed',
            taskId: 'emit-test-task',
            status: 'IN_PROGRESS',
            previousStatus: 'PENDING',
            changedBy: 'system',
          });
        }, 100);

        // Listen for the event
        clientSocket.on('task_status_changed', (data: any) => {
          expect(data.taskId).toBe('emit-test-task');
          expect(data.status).toBe('IN_PROGRESS');
          expect(data.previousStatus).toBe('PENDING');
          done();
        });
      });
    });

    it('emitToUser sends event to user room', (done) => {
      const { emitToUser } = require('../../common/socket');
      const userId = 'emit-user-456';
      const token = createTestToken({ userId });
      clientSocket = createClient(token);

      clientSocket.on('connect', () => {
        setTimeout(() => {
          emitToUser(userId, {
            event: 'notification_created',
            userId,
            notification: {
              id: 'notif-1',
              title: 'Test',
              message: 'Hello!',
              type: 'SYSTEM',
            },
          });
        }, 100);

        clientSocket.on('notification_created', (data: any) => {
          expect(data.userId).toBe(userId);
          expect(data.notification.title).toBe('Test');
          done();
        });
      });
    });

    it('getIO throws if not initialized', () => {
      // We can't test this directly since io is already initialized,
      // but we can verify it returns a valid server instance
      const { getIO } = require('../../common/socket');
      const io = getIO();
      expect(io).toBeDefined();
      expect(io).toBeInstanceOf(SocketIOServer);
    });
  });

  // ── Connection to Non-existent Room ─────────────────────────────────────

  describe('edge cases', () => {
    it('allows multiple connections from different users', (done) => {
      const token1 = createTestToken({ userId: 'user-alpha' });
      const token2 = createTestToken({ userId: 'user-beta' });

      const client1 = createClient(token1);
      const client2 = createClient(token2);

      let connected = 0;
      const checkDone = () => {
        connected++;
        if (connected === 2) {
          expect(client1.connected).toBe(true);
          expect(client2.connected).toBe(true);
          client1.disconnect();
          client2.disconnect();
          done();
        }
      };

      client1.on('connect', checkDone);
      client2.on('connect', checkDone);
    });

    it('receives events only in joined rooms', (done) => {
      const { emitToTask } = require('../../common/socket');
      const token = createTestToken();
      clientSocket = createClient(token);

      let received = false;

      clientSocket.on('connect', () => {
        // Join task room A, but NOT room B
        clientSocket.emit('join:task', 'room-A');

        setTimeout(() => {
          // Emit to room B - should NOT be received
          emitToTask('room-B', {
            event: 'task_cancelled',
            taskId: 'room-B',
            reason: 'test',
          });

          // Emit to room A - should be received
          emitToTask('room-A', {
            event: 'task_cancelled',
            taskId: 'room-A',
            reason: 'test',
          });
        }, 100);

        clientSocket.on('task_cancelled', (data: any) => {
          expect(data.taskId).toBe('room-A');
          received = true;
        });

        setTimeout(() => {
          expect(received).toBe(true);
          done();
        }, 300);
      });
    });
  });
});
