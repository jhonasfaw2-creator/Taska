export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'TASK_REQUEST' | 'TASK_UPDATE' | 'PAYMENT' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface NotificationState {
  unreadCount: number;
}
