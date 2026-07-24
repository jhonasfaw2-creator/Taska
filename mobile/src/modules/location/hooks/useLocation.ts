import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import {
  getCurrentPosition,
  startLocationUpdates,
  requestLocationPermission,
  getForegroundPermissionStatus,
  type LocationData,
  type LocationSubscription,
  type PermissionStatus,
} from '../services/location.service';

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  updateIntervalMs?: number;
  autoStart?: boolean;
}

export interface UseLocationResult {
  location: LocationData | null;
  permission: PermissionStatus;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<PermissionStatus>;
  getLocation: () => Promise<LocationData | null>;
  startUpdates: () => void;
  stopUpdates: () => void;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationResult {
  const { enableHighAccuracy = true, autoStart = false } = options;
  const [location, setLocation] = useState<LocationData | null>(null);
  const [permission, setPermission] = useState<PermissionStatus>('undetermined');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<LocationSubscription | null>(null);

  const checkPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPermission('granted');
      return 'granted';
    }
    const status = await getForegroundPermissionStatus();
    setPermission(status);
    return status;
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await requestLocationPermission();
      setPermission(status);
      return status;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request location permission';
      setError(message);
      return 'denied';
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentPosition(enableHighAccuracy ? 'high' : 'medium');
      setLocation(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [enableHighAccuracy]);

  const stopUpdates = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }, []);

  const startUpdates = useCallback(async () => {
    stopUpdates();
    if (Platform.OS === 'web') return;

    try {
      const sub = await startLocationUpdates(
        (data) => setLocation(data),
        enableHighAccuracy ? 'high' : 'medium',
      );
      subscriptionRef.current = sub;
    } catch {
      // location updates failed silently
    }
  }, [enableHighAccuracy, stopUpdates]);

  useEffect(() => {
    checkPermission();
    if (autoStart) {
      startUpdates();
    }
    return () => {
      stopUpdates();
    };
  }, [autoStart, checkPermission, startUpdates, stopUpdates]);

  return {
    location,
    permission,
    loading,
    error,
    requestPermission,
    getLocation,
    startUpdates,
    stopUpdates,
  };
}
