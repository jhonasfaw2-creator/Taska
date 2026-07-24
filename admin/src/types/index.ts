export interface User {
  id: string; firstName: string | null; lastName: string | null; phoneNumber: string;
  email: string | null; role: string; isVerified: boolean; isOnboarded: boolean;
  deletedAt: string | null; createdAt: string; updatedAt: string;
  taskerProfile?: { verificationStatus: string; isOnline: boolean; rating: number; totalTasksCompleted: number } | null;
  _count?: { tasks: number; payments: number; notifications: number };
}

export interface Task {
  id: string; title: string; description: string; status: string;
  estimatedPrice: number; finalPrice: number | null;
  pickupAddress: string; dropoffAddress: string;
  customer: { id: string; firstName: string | null; lastName: string | null };
  tasker?: { id: string; user: { firstName: string | null; lastName: string | null } } | null;
  category: { id: string; name: string };
  createdAt: string;
}

export interface Tasker {
  id: string; verificationStatus: string; rating: number; totalTasksCompleted: number;
  isOnline: boolean; bio: string | null; experience: number | null;
  user: { id: string; firstName: string | null; lastName: string | null; phoneNumber: string; email: string | null };
  wallet?: { balance: number; availableBalance: number; totalEarned: number; totalWithdrawn: number } | null;
  _count?: { tasks: number; offers: number; verificationDocuments: number };
}

export interface Payment {
  id: string; taskId: string; customerId: string; amount: number; platformFee: number;
  taskerAmount: number; paymentMethod: string; paymentStatus: string;
  provider: string; transactionReference: string | null; refundedAmount: number;
  createdAt: string;
  customer?: { firstName: string | null; lastName: string | null; phoneNumber: string };
  task?: { id: string; title: string; status: string };
  refunds?: any[];
}

export interface Wallet {
  id: string; taskerId: string; balance: number; pendingBalance: number;
  availableBalance: number; totalEarned: number; totalWithdrawn: number;
  totalRefunded: number; currency: string;
  tasker?: { user: { firstName: string | null; lastName: string | null; phoneNumber: string } };
}

export interface DashboardStats {
  totalUsers: number; activeCustomers: number; activeTaskers: number;
  onlineTaskers: number; tasksToday: number; tasksInProgress: number;
  completedTasks: number; cancelledTasks: number; pendingVerifications: number;
  revenueToday: number; revenueThisMonth: number;
  totalWalletBalance: number; totalPendingBalance: number; totalAvailableBalance: number;
}

export interface AuditLog {
  id: number; adminId: string | null; action: string; entityType: string;
  entityId: string; changes: any; ipAddress: string | null;
  createdAt: string;
  admin?: { user: { firstName: string | null; lastName: string | null } } | null;
}

export interface AdminUser {
  id: string; userId: string; role: string;
  user: { firstName: string | null; lastName: string | null; phoneNumber: string; email: string | null };
  _count?: { auditLogs: number };
}
