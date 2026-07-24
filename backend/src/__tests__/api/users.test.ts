jest.mock('../../modules/users/user.service', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  updateRole: jest.fn(),
}));

jest.mock('../../common/middleware/auth.middleware', () => ({
  requireAuth: jest.fn((req: any, _res: any, next: any) => {
    req.user = { userId: 'user-1', phoneNumber: '+251911111111', role: 'CUSTOMER' };
    next();
  }),
}));

import request from 'supertest';
import { createApp } from '../../app';
import * as userService from '../../modules/users/user.service';

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Users API', () => {
  describe('GET /api/v1/users/profile', () => {
    it('returns user profile', async () => {
      (userService.getProfile as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phoneNumber: '+251911111111',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profileImage: null,
        role: 'CUSTOMER',
        isOnboarded: true,
        createdAt: '2026-07-20T12:00:00.000Z',
      });

      const res = await request(app).get('/api/v1/users/profile');

      expect(res.status).toBe(200);
      expect(res.body.phoneNumber).toBe('+251911111111');
    });
  });

  describe('PATCH /api/v1/users/profile', () => {
    it('updates profile fields', async () => {
      (userService.updateProfile as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phoneNumber: '+251911111111',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'CUSTOMER',
        isOnboarded: true,
      });

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .send({ firstName: 'Updated', lastName: 'Name' });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('Updated');
    });
  });

  describe('PATCH /api/v1/users/role', () => {
    it('updates user role', async () => {
      (userService.updateRole as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phoneNumber: '+251911111111',
        role: 'TASKER',
      });

      const res = await request(app).patch('/api/v1/users/role').send({ role: 'TASKER' });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('TASKER');
    });
  });
});
