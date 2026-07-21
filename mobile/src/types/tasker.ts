export interface TaskerProfile {
  id: string;
  userId: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rating: number;
  totalTasksCompleted: number;
  isOnline: boolean;
  bio: string | null;
  experience: number | null;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}
