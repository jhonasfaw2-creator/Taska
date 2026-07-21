export type TaskStatus =
  | 'PENDING'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RecentTask {
  id: string;
  title: string;
  status: TaskStatus;
  estimatedPrice: number;
  finalPrice: number | null;
  createdAt: string;
  categoryName: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
}

export interface TaskCreateRequest {
  categoryId: string;
  title: string;
  description: string;
  specialInstructions?: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  vehicleType: string;
  estimatedPrice: number;
}

export interface TaskResponse {
  id: string;
  customerId: string;
  categoryId: string;
  title: string;
  description: string;
  specialInstructions: string | null;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  vehicleType: string;
  estimatedPrice: number;
  finalPrice: number | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
