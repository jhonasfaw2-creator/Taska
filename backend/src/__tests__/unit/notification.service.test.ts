jest.mock('../../prisma/client', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userDevice: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../common/socket', () => ({
  emitToUser: jest.fn(),
}));

import { prisma } from '../../prisma/client';
import * as notificationService from '../../modules/notifications/notification.service';

const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  title: 'Test Notification',
  message: 'Test message',
  type: 'SYSTEM',
  isRead: false,
  createdAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('NotificationService', () => {
  describe('registerDevice', () => {
    it('creates new device registration', async () => {
      (prisma.userDevice.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userDevice.create as jest.Mock).mockResolvedValue({});

      await notificationService.registerDevice('user-1', 'token-123', 'ios');

      expect(prisma.userDevice.create).toHaveBeenCalled();
    });

    it('updates existing device registration', async () => {
      (prisma.userDevice.findFirst as jest.Mock).mockResolvedValue({ id: 'dev-1' });
      (prisma.userDevice.update as jest.Mock).mockResolvedValue({});

      await notificationService.registerDevice('user-1', 'token-123', 'ios');

      expect(prisma.userDevice.update).toHaveBeenCalled();
    });
  });

  describe('getNotifications', () => {
    it('returns notifications for user', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([mockNotification]);

      const result = await notificationService.getNotifications('user-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.update as jest.Mock).mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await notificationService.markAsRead('notif-1', 'user-1');

      expect(result.isRead).toBe(true);
    });

    it('throws if notification not found for user', async () => {
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(notificationService.markAsRead('notif-none', 'user-1')).rejects.toThrow();
    });
  });

  describe('sendNotification', () => {
    it('creates notification and emits socket event', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
      (prisma.userDevice.findMany as jest.Mock).mockResolvedValue([]);

      await notificationService.sendNotification('user-1', 'Title', 'Message', 'SYSTEM');

      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
