jest.mock('../../modules/notifications/notification.service', () => ({
  registerDevice: jest.fn(),
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
}));

jest.mock('../../common/middleware/auth.middleware', () => ({
  requireAuth: jest.fn((req: any, _res: any, next: any) => {
    req.user = { userId: 'user-1', phoneNumber: '+251911111111', role: 'CUSTOMER' };
    next();
  }),
}));

import request from 'supertest';
import { createApp } from '../../app';
import * as notificationService from '../../modules/notifications/notification.service';

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Notifications API', () => {
  describe('POST /api/v1/notifications/register-device', () => {
    it('registers a device', async () => {
      (notificationService.registerDevice as jest.Mock).mockResolvedValue({
        message: 'Device registered successfully',
      });

      const res = await request(app)
        .post('/api/v1/notifications/register-device')
        .send({ pushToken: 'ExponentPushToken[xxx]', platform: 'ios' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Device registered successfully');
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/api/v1/notifications/register-device').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('returns notifications', async () => {
      (notificationService.getNotifications as jest.Mock).mockResolvedValue([
        { id: 'notif-1', title: 'Test', message: 'Test', type: 'SYSTEM', isRead: false },
      ]);

      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('marks notification as read', async () => {
      (notificationService.markAsRead as jest.Mock).mockResolvedValue({
        id: 'notif-1',
        isRead: true,
      });

      const res = await request(app).patch('/api/v1/notifications/notif-1/read');
      expect(res.status).toBe(200);
      expect(res.body.isRead).toBe(true);
    });
  });
});
