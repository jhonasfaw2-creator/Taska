export interface TaskerProfile {
  id: string;
  userId: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rating: number;
  totalTasksCompleted: number;
  isOnline: boolean;
  latitude: number | null;
  longitude: number | null;
  lastLocationUpdate: string | null;
  bio: string | null;
  experience: number | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}
