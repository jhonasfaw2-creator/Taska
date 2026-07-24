import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import { Platform } from 'react-native';

export type LocationAccuracy = 'low' | 'medium' | 'high' | 'best';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface LocationData {
  coords: LocationCoords;
  timestamp: number;
}

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export { type LocationSubscription } from 'expo-location';

export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    if (Platform.OS === 'web') {
      return 'granted';
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      return 'granted';
    }
    return 'denied';
  } catch {
    return 'denied';
  }
}

export async function getForegroundPermissionStatus(): Promise<PermissionStatus> {
  try {
    if (Platform.OS === 'web') {
      return 'granted';
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      return 'granted';
    }
    if (status === Location.PermissionStatus.DENIED) {
      return 'denied';
    }
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

export async function getCurrentPosition(
  accuracy: LocationAccuracy = 'high',
): Promise<LocationData> {
  try {
    const permissionStatus = await getForegroundPermissionStatus();
    if (permissionStatus !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const location: LocationObject = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy[accuracy.toUpperCase() as keyof typeof Location.Accuracy] || Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 0,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude ?? null,
        accuracy: location.coords.accuracy ?? null,
        altitudeAccuracy: location.coords.altitudeAccuracy ?? null,
        heading: location.coords.heading ?? null,
        speed: location.coords.speed ?? null,
      },
      timestamp: location.timestamp,
    };
  } catch (error) {
    throw new Error(`Failed to get current location: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function startLocationUpdates(
  onUpdate: (data: LocationData) => void,
  accuracy: LocationAccuracy = 'high',
): Promise<LocationSubscription | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy[accuracy.toUpperCase() as keyof typeof Location.Accuracy] || Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      onUpdate({
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude ?? null,
          accuracy: location.coords.accuracy ?? null,
          altitudeAccuracy: location.coords.altitudeAccuracy ?? null,
          heading: location.coords.heading ?? null,
          speed: location.coords.speed ?? null,
        },
        timestamp: location.timestamp,
      });
    },
  );
}
