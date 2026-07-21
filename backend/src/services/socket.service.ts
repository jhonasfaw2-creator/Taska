import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env';
import { JwtPayload } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

type TaskEventPayload =
  | { event: 'task_created'; taskId: string; title: string }
  | { event: 'task_matched'; taskId: string; taskerId: string; taskerName: string }
  | { event: 'task_accepted'; taskId: string; taskerId: string; taskerName: string }
  | { event: 'task_status_changed'; taskId: string; status: string; previousStatus: string; changedBy: string }
  | { event: 'task_cancelled'; taskId: string; reason?: string }
  | { event: 'new_message'; taskId: string; messageId: string; senderId: string; text: string; createdAt: string }
  | { event: 'notification_created'; userId: string; notification: { id: string; title: string; message: string; type: string } };

// ─── Singleton ───────────────────────────────────────────────────────────────

let io: Server | null = null;

/**
 * Initialise the Socket.IO server, attach it to the existing HTTP server,
 * and configure JWT-based authentication middleware + room management.
 */
export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: envConfig.corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  // ── JWT authentication middleware ─────────────────────
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token ?? socket.handshake.query?.token as string | undefined;

    if (!token) {
      return next(new Error('Authentication required. No token provided.'));
    }

    try {
      const decoded = jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
      (socket as AuthenticatedSocket).userId = decoded.userId;
      (socket as AuthenticatedSocket).userRole = decoded.role;
      next();
    } catch {
      return next(new Error('Invalid or expired token.'));
    }
  });

  // ── Connection handler ────────────────────────────────
  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    console.log(`[Socket] ${userRole} connected: ${userId} (socket ${socket.id})`);

    // Join a personal room so we can send targeted events
    socket.join(`user:${userId}`);

    // ── Client can join a task room to receive live updates ──
    socket.on('join:task', (taskId: string) => {
      if (typeof taskId !== 'string') return;
      socket.join(`task:${taskId}`);
      console.log(`[Socket] ${userId} joined task:${taskId}`);
    });

    socket.on('leave:task', (taskId: string) => {
      if (typeof taskId !== 'string') return;
      socket.leave(`task:${taskId}`);
    });

    // ── Generic disconnect ──────────────────────────────
    socket.on('disconnect', (reason: string) => {
      console.log(`[Socket] ${userId} disconnected (${reason})`);
    });
  });

  console.log('[Socket] Socket.IO server initialised.');
  return io;
}

/**
 * Get the Socket.IO server instance. Throws if not initialised.
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialised. Call initSocketServer() first.');
  }
  return io;
}

// ─── Emitter helpers ─────────────────────────────────────────────────────────

/**
 * Emit an event to everyone in a task room (customer + tasker).
 */
export function emitToTask(taskId: string, payload: TaskEventPayload): void {
  const srv = getIO();
  srv.to(`task:${taskId}`).emit(payload.event, { ...payload, taskId });
}

/**
 * Emit an event to a specific user's personal room.
 */
export function emitToUser(userId: string, payload: TaskEventPayload): void {
  const srv = getIO();
  srv.to(`user:${userId}`).emit(payload.event, payload);
}
