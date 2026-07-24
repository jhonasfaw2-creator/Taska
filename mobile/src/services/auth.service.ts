import * as SecureStore from 'expo-secure-store';
import api, { ApiError } from '../config/api';
import {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UserSession,
  UserProfile,
} from '../types/auth';

// ─── Storage keys ────────────────────────────────────────

const SECURE_KEYS = {
  ACCESS_TOKEN: 'taska_access_token',
  REFRESH_TOKEN: 'taska_refresh_token',
} as const;

const STORAGE_KEYS = {
  PHONE_NUMBER: '@taska/phone_number',
} as const;

// ─── AsyncStorage lazy import (for non-sensitive data) ──
let _AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null;

async function getStorage() {
  if (!_AsyncStorage) {
    const mod = await import('@react-native-async-storage/async-storage');
    _AsyncStorage = mod.default;
  }
  return _AsyncStorage;
}

// ─── Public API ────────────────────────────────────────

/**
 * Send a 6-digit OTP to the given phone number.
 *
 * In development mode the response includes the OTP value so
 * it can be displayed or auto-filled for testing.
 */
export async function sendOTP(phoneNumber: string): Promise<SendOtpResponse> {
  console.log('[sendOTP] Called with phoneNumber:', phoneNumber);
  const body: SendOtpRequest = { phoneNumber };
  console.log('[sendOTP] Sending POST to /auth/send-otp with body:', JSON.stringify(body));
  try {
    const response = await api.post<SendOtpResponse>('/auth/send-otp', body);
    console.log('[sendOTP] Response received:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.log('[sendOTP] Error caught:', error);
    throw error;
  }
}

/**
 * Verify the OTP code, persist the returned JWT securely and
 * the phone number to local storage, then return the session data.
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string,
): Promise<UserSession> {
  console.log('[verifyOTP] Called with phoneNumber:', phoneNumber, 'code:', code);
  const body: VerifyOtpRequest = { phoneNumber, code };
  console.log('[verifyOTP] Sending POST to /auth/verify-otp with body:', JSON.stringify(body));
  try {
    const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', body);
    console.log('[verifyOTP] Response received:', JSON.stringify(response.data));

    const { accessToken, refreshToken } = response.data;

    await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    const storage = await getStorage();
    await storage.setItem(STORAGE_KEYS.PHONE_NUMBER, phoneNumber);
    console.log('[verifyOTP] Session persisted successfully');

    try {
      const { connectSocket } = await import('./socket.service');
      await connectSocket();
    } catch {
      // Socket connection is best-effort
    }

    return { accessToken, phoneNumber };
  } catch (error) {
    console.log('[verifyOTP] Error caught:', error);
    throw error;
  }
}

/**
 * Check whether a local session exists (i.e. the user has
 * completed phone verification in a previous app session).
 */
export async function hasSession(): Promise<boolean> {
  try {
    const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    return token !== null && token.length > 0;
  } catch {
    return false;
  }
}

/**
 * Retrieve the stored access token. Used by the API request
 * interceptor to attach the Authorization header.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Retrieve the stored refresh token.
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Refresh the access token using the stored refresh token.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const response = await api.post<{ accessToken: string }>('/auth/refresh-token', { refreshToken });
    const newAccessToken = response.data.accessToken;
    await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, newAccessToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

/**
 * Retrieve the stored phone number of the current session.
 */
export async function getStoredPhoneNumber(): Promise<string | null> {
  try {
    const storage = await getStorage();
    return storage.getItem(STORAGE_KEYS.PHONE_NUMBER);
  } catch {
    return null;
  }
}

/**
 * Clear all persisted auth data (sign out).
 */
export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    const storage = await getStorage();
    await storage.removeItem(STORAGE_KEYS.PHONE_NUMBER);

    try {
      const { disconnectSocket } = await import('./socket.service');
      disconnectSocket();
    } catch {
      // Best-effort cleanup
    }
  } catch {
    // Best-effort cleanup
  }
}

/**
 * Fetch the authenticated user's profile from the API.
 * The auth token is automatically attached by the request interceptor.
 */
export async function getUserProfile(): Promise<UserProfile> {
  console.log('[getUserProfile] Fetching user profile');
  try {
    const response = await api.get<UserProfile>('/users/profile');
    console.log('[getUserProfile] Response:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.log('[getUserProfile] Error caught:', error);
    throw error;
  }
}

/**
 * Determine whether the user has completed their profile setup.
 * A profile is considered incomplete if the user has placeholder
 * data (firstName: 'User', lastName: '') set during OTP verification.
 */
/**
 * Update the authenticated user's profile.
 */
export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
}): Promise<UserProfile> {
  const response = await api.patch<UserProfile>('/users/profile', data);
  return response.data;
}

export function isProfileComplete(profile: UserProfile): boolean {
  return (
    profile.firstName !== 'User' &&
    profile.lastName !== ''
  );
}

export { ApiError };
export type { SendOtpResponse, VerifyOtpResponse, UserSession, UserProfile };
