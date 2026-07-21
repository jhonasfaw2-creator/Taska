import api from '../config/api';
import type { RecentTask, TaskResponse, TaskStatus } from '../types/task';
import type { TaskFormData } from '@/store/TaskContext';
import { fetchCategories } from './category.service';

let lastCreatedTaskId: string | null = null;

export function getLastCreatedTaskId(): string | null {
  return lastCreatedTaskId;
}

export async function fetchRecentTasks(): Promise<RecentTask[]> {
  const response = await api.get<RecentTask[]>('/tasks');
  return response.data;
}

/**
 * Rough distance estimate using the Haversine formula.
 * Returns distance in kilometres between two lat/lng points.
 */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate a simple price estimate based on distance and vehicle type.
 */
function estimatePrice(distanceKm: number, vehicleType: string | null): number {
  const baseFare = 3.00;
  const ratePerKm: Record<string, number> = {
    WALKING: 0.50,
    MOTORCYCLE: 1.00,
    CAR: 2.50,
    VAN: 3.50,
    TRUCK: 5.00,
  };
  const rate = ratePerKm[(vehicleType ?? '').toUpperCase()] ?? 2.00;
  const distanceCharge = distanceKm * rate;
  return Math.round((baseFare + distanceCharge) * 100) / 100;
}

export async function createTask(form: TaskFormData): Promise<TaskResponse> {
  // ── Validate required fields ────────────────────────────
  if (!form.category) {
    throw new Error('Please select a category before creating a task.');
  }
  if (!form.title.trim()) {
    throw new Error('Task title is required.');
  }
  if (!form.description.trim()) {
    throw new Error('Task description is required.');
  }
  if (!form.pickup || !form.pickup.address) {
    throw new Error('Pickup location is required.');
  }
  if (!form.dropoff || !form.dropoff.address) {
    throw new Error('Drop-off location is required.');
  }

  const categories = await fetchCategories();
  const matched = categories.find((c) => c.slug === form.category?.slug);
  if (!matched) {
    throw new Error(`Category "${form.category?.slug}" not found on the server.`);
  }

  // ── Estimate price from distance ────────────────────────
  const distance = haversineKm(
    form.pickup.latitude,
    form.pickup.longitude,
    form.dropoff.latitude,
    form.dropoff.longitude,
  );
  const estimatedPrice = estimatePrice(distance, form.vehicleType);

  // ── Build request body ──────────────────────────────────
  const body: Record<string, unknown> = {
    categoryId: matched.id,
    title: form.title.trim(),
    description: form.description.trim(),
    pickupAddress: form.pickup.address,
    pickupLatitude: form.pickup.latitude,
    pickupLongitude: form.pickup.longitude,
    dropoffAddress: form.dropoff.address,
    dropoffLatitude: form.dropoff.latitude,
    dropoffLongitude: form.dropoff.longitude,
    vehicleType: (form.vehicleType ?? 'CAR').toUpperCase(),
    estimatedPrice,
  };

  if (form.specialInstructions.trim()) {
    body.specialInstructions = form.specialInstructions.trim();
  }

  const response = await api.post<TaskResponse>('/tasks', body);
  lastCreatedTaskId = response.data.id;
  return response.data;
}

/**
 * Update a task's status (e.g. cancel, search, pickup, complete).
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<{ id: string; status: string; previousStatus: string; message: string }> {
  const response = await api.patch<{
    id: string;
    status: string;
    previousStatus: string;
    message: string;
  }>(`/tasks/${taskId}/status`, { status });
  return response.data;
}

/**
 * Fetch the ordered status history for a task.
 */
export async function getTaskStatusHistory(
  taskId: string,
): Promise<{ status: string; changedBy: string; createdAt: string }[]> {
  const response = await api.get<{
    status: string;
    changedBy: string;
    createdAt: string;
  }[]>(`/tasks/${taskId}/status-history`);
  return response.data;
}

/**
 * Fetch full task details by ID.
 */
export async function getTaskById(taskId: string): Promise<TaskResponse> {
  const response = await api.get<TaskResponse>(`/tasks/${taskId}`);
  return response.data;
}
