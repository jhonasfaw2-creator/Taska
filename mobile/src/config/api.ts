import { create as createApiInstance, AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
// ─── Base URL resolution ──────────────────────────────
//
// Priority order:
//   1) EXPO_PUBLIC_API_URL env var (explicit override)
//   2) app.json / app.config.js extra.apiUrl
//   3) Expo dev-server hostUri  →  http://{hostIp}:5000/api/v1
//      This is the magic sauce: when running via Expo Go on a
//      physical device, Constants.expoConfig?.hostUri contains
//      the developer machine's LAN IP (e.g. 192.168.1.42:8081).
//      We swap the port to reach the backend on the same machine.
//   4) Fallback for local dev server / simulator
const EXTRA = Constants.expoConfig?.extra as Record<string, string> | undefined;

function resolveBaseUrl(): string {
  // 1) Env var (Expo Web / EAS Build)
  const envUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  if (envUrl) return envUrl;

  // 2) app.json extra
  if (EXTRA?.apiUrl) return EXTRA.apiUrl;

  // 3) Expo dev-server hostUri → http://{ip}:5000/api/v1
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0]; // strip the Expo port
    return `http://${ip}:5000/api/v1`;
  }

  // 4) Fallback for web / simulator
  return 'http://localhost:5000/api/v1';
}

const BASE_URL = resolveBaseUrl();

console.log('[API] Resolved BASE_URL:', BASE_URL);

// ─── Axios instance ────────────────────────────────────

const api: AxiosInstance = createApiInstance({
  baseURL: BASE_URL,
  timeout: 15_000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor: attach auth token ────────────
// Token is injected at request time so it stays fresh even if
// the session is updated after the instance is created.
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: () => Promise<string | null>): void {
  _getToken = fn;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  console.log('[API] Request:', config.method?.toUpperCase(), config.url, config.data);
  if (_getToken) {
    const token = await _getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor: normalise errors ────────────

export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    console.log('[API] Error:', error.message, 'code:', error.code, 'status:', error.response?.status);
    if (error.response) {
      const message =
        error.response.data?.error ??
        error.response.data?.message ??
        `Request failed with status ${error.response.status}`;
      console.log('[API] Server responded with error:', message);
      throw new ApiError(message, error.response.status);
    }

    if (error.request) {
      console.log('[API] No response received - server may be down');
      throw new ApiError(
        'Cannot reach the server. Make sure the backend is running and your phone is on the same Wi-Fi network.',
        0,
      );
    }

    console.log('[API] Unexpected error:', error.message);
    throw new ApiError('An unexpected error occurred.', 0);
  },
);

export default api;
