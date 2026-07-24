import api from '../config/api';
import type { TaskerProfile } from '../types/tasker';

export async function applyAsTasker(data: {
  vehicleType: string;
  experience?: number;
  bio?: string;
}): Promise<{ message: string; taskerProfile: TaskerProfile }> {
  const response = await api.post<{ message: string; taskerProfile: TaskerProfile }>(
    '/taskers/apply',
    data,
  );
  return response.data;
}

export async function getTaskerProfile(): Promise<TaskerProfile> {
  const response = await api.get<TaskerProfile>('/taskers/profile');
  return response.data;
}

export interface AvailableTask {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedPrice: number;
  offerPrice: number;
  offerId: string;
  customerRating: number | null;
  createdAt: string;
}

export async function getAvailableTasks(): Promise<AvailableTask[]> {
  const response = await api.get<AvailableTask[]>('/taskers/tasks');
  return response.data;
}

export async function updateOnlineStatus(isOnline: boolean): Promise<TaskerProfile> {
  const response = await api.patch<TaskerProfile>('/taskers/status', { isOnline });
  return response.data;
}

export interface NearbyTask {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  estimatedPrice: number;
  customerRating: number | null;
  distanceKm: number;
  status: string;
  createdAt: string;
}

export async function getNearbyTasks(options: {
  radiusKm?: number;
  vehicleType?: string;
}): Promise<NearbyTask[]> {
  const params: Record<string, string | number> = {};
  if (options.radiusKm) params.radius = options.radiusKm;
  if (options.vehicleType) params.vehicleType = options.vehicleType;
  const response = await api.get<{ success: boolean; data: NearbyTask[] }>('/taskers/nearby-tasks', { params });
  return response.data.data ?? [];
}

export async function updateTaskerLocation(latitude: number, longitude: number): Promise<{
  id: string;
  latitude: number;
  longitude: number;
  lastLocationUpdate: string;
  isOnline: boolean;
}> {
  const response = await api.post('/taskers/location', { latitude, longitude });
  return response.data.data;
}

