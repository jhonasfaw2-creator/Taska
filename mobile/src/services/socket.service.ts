import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './auth.service';
import Constants from 'expo-constants';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

type StatusChangeListener = (status: ConnectionStatus) => void;
type EventListener = (data: any) => void;

// ─── Singleton ───────────────────────────────────────────────────────────────

let socket: Socket | null = null;
let statusListeners: Set<StatusChangeListener> = new Set();
let manualDisconnect = false;

// Queued listeners for components that subscribe before the socket connects.
// Flushed into the real socket once connection is established.
let pendingListeners: Map<string, Set<EventListener>> = new Map();

function resolveSocketUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  if (envUrl) {
    return envUrl.replace(/\/api\/v1\/?$/, '');
  }

  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  if (extra?.apiUrl) {
    return extra.apiUrl.replace(/\/api\/v1\/?$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }

  return 'http://localhost:5000';
}

/**
 * Flush any listeners that were queued while the socket was null
 * into the newly created socket instance.
 */
function flushPendingListeners(): void {
  if (!socket) return;
  pendingListeners.forEach((listeners, event) => {
    listeners.forEach((listener) => {
      socket!.on(event, listener);
    });
  });
  pendingListeners.clear();
}

/**
 * Connect to the Socket.IO server with JWT authentication.
 *
 * Should be called once after the user authenticates (OTP verification).
 * Automatically reconnects on connection loss.
 */
export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }

  manualDisconnect = false;

  const serverUrl = resolveSocketUrl();
  console.log('[Socket] Connecting to:', serverUrl);

  const token = await getAccessToken();

  socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2_000,
    reconnectionDelayMax: 15_000,
    timeout: 20_000,
    auth: { token: token ?? '' },
  });

  // ── Connection lifecycle handlers ─────────────────────

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    flushPendingListeners();
    notifyStatus('connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    if (manualDisconnect) {
      notifyStatus('offline');
    } else {
      notifyStatus('reconnecting');
    }
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log('[Socket] Reconnect attempt:', attempt);
    notifyStatus('reconnecting');
  });

  socket.on('reconnect_failed', () => {
    console.log('[Socket] Reconnect failed');
    notifyStatus('offline');
  });

  socket.on('connect_error', (err) => {
    console.log('[Socket] Connection error:', err.message);
    notifyStatus('reconnecting');
  });

  return socket;
}

/**
 * Gracefully disconnect from the Socket.IO server.
 */
export function disconnectSocket(): void {
  manualDisconnect = true;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  pendingListeners.clear();
  notifyStatus('offline');
}

/**
 * Join a task room to receive real-time updates for that task.
 */
export function joinTaskRoom(taskId: string): void {
  if (socket?.connected) {
    socket.emit('join:task', taskId);
    console.log(`[Socket] Joined task room: ${taskId}`);
  }
}

/**
 * Leave a task room when no longer viewing that task.
 */
export function leaveTaskRoom(taskId: string): void {
  if (socket?.connected) {
    socket.emit('leave:task', taskId);
    console.log(`[Socket] Left task room: ${taskId}`);
  }
}

/**
 * Subscribe to a specific Socket.IO event.
 *
 * If the socket is already connected, attaches the listener immediately.
 * Otherwise, queues it — it will be flushed once the socket connects.
 * Returns an unsubscribe function.
 */
export function onSocketEvent(event: string, listener: EventListener): () => void {
  if (socket?.connected) {
    socket.on(event, listener);
  } else {
    // Queue the listener for when the socket connects
    if (!pendingListeners.has(event)) {
      pendingListeners.set(event, new Set());
    }
    pendingListeners.get(event)!.add(listener);
  }

  return () => {
    socket?.off(event, listener);
    // Also remove from pending queue if not yet flushed
    const pending = pendingListeners.get(event);
    if (pending) {
      pending.delete(listener);
      if (pending.size === 0) {
        pendingListeners.delete(event);
      }
    }
  };
}

/**
 * Subscribe to connection status changes.
 * Returns an unsubscribe function.
 */
export function onStatusChange(listener: StatusChangeListener): () => void {
  statusListeners.add(listener);
  // Immediately notify with current status
  if (socket?.connected) {
    listener('connected');
  } else if (socket) {
    listener('reconnecting');
  } else {
    listener('offline');
  }
  return () => {
    statusListeners.delete(listener);
  };
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function notifyStatus(status: ConnectionStatus): void {
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch {
      // Silently ignore listener errors
    }
  });
}
