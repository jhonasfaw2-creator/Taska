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

export async function updateOnlineStatus(isOnline: boolean): Promise<TaskerProfile> {
  const response = await api.patch<TaskerProfile>('/taskers/status', { isOnline });
  return response.data;
}
