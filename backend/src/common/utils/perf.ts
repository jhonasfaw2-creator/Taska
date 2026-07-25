import { logger } from './logger';

interface RequestStats {
  count: number;
  totalDuration: number;
  maxDuration: number;
  minDuration: number;
}

const SLOW_THRESHOLD_MS = 500;
const DB_SLOW_THRESHOLD_MS = 1000;
const METRICS_WINDOW_MS = 5 * 60 * 1000;

const requestCount = new Map<string, number>();
const routeStats = new Map<string, RequestStats>();
let totalRequests = 0;
let windowStart = Date.now();

function getOrCreateRouteStats(route: string): RequestStats {
  let stats = routeStats.get(route);
  if (!stats) {
    stats = { count: 0, totalDuration: 0, maxDuration: 0, minDuration: Infinity };
    routeStats.set(route, stats);
  }
  return stats;
}

function resetIfWindowExpired(): void {
  if (Date.now() - windowStart > METRICS_WINDOW_MS) {
    requestCount.clear();
    routeStats.clear();
    totalRequests = 0;
    windowStart = Date.now();
  }
}

export const perf = {
  recordRequest(method: string, path: string, duration: number, statusCode: number): void {
    resetIfWindowExpired();
    totalRequests++;
    const route = `${method} ${path}`;
    requestCount.set(route, (requestCount.get(route) ?? 0) + 1);

    const stats = getOrCreateRouteStats(route);
    stats.count++;
    stats.totalDuration += duration;
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.minDuration = Math.min(stats.minDuration, duration);

    if (duration > SLOW_THRESHOLD_MS) {
      logger.warn(
        { method, path, duration, statusCode, threshold: SLOW_THRESHOLD_MS },
        'slow request',
      );
    }
  },

  recordQuery(model: string, operation: string, duration: number): void {
    const label = `${model}.${operation}`;
    requestCount.set(label, (requestCount.get(label) ?? 0) + 1);

    const stats = getOrCreateRouteStats(label);
    stats.count++;
    stats.totalDuration += duration;
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.minDuration = Math.min(stats.minDuration, duration);

    if (duration > DB_SLOW_THRESHOLD_MS) {
      logger.warn(
        { model, operation, duration, threshold: DB_SLOW_THRESHOLD_MS },
        'slow database query',
      );
    }
  },

  getMetrics() {
    const statsList = Array.from(routeStats.entries()).map(([route, s]) => ({
      route,
      count: s.count,
      avgMs: s.count > 0 ? Math.round((s.totalDuration / s.count) * 100) / 100 : 0,
      maxMs: s.maxDuration,
      minMs: s.minDuration === Infinity ? 0 : s.minDuration,
    }));

    return {
      totalRequests,
      requestCount: Object.fromEntries(requestCount),
      routes: statsList,
      windowSeconds: METRICS_WINDOW_MS / 1000,
    };
  },

  reset(): void {
    requestCount.clear();
    routeStats.clear();
    totalRequests = 0;
    windowStart = Date.now();
  },
};
