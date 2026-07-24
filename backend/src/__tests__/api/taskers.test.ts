jest.mock('../../prisma/client', () => ({
  prisma: {
    taskerProfile: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../modules/taskers/tasker.service', () => ({
  applyAsTasker: jest.fn(),
  getProfile: jest.fn(),
  updateStatus: jest.fn(),
}));

jest.mock('../../modules/taskers/taskerTasks.service', () => ({
  getAvailableTasks: jest.fn(),
}));

jest.mock('../../common/middleware/auth.middleware', () => ({
  requireAuth: jest.fn((req: any, _res: any, next: any) => {
    req.user = { userId: 'user-1', phoneNumber: '+251911111111', role: 'TASKER' };
    next();
  }),
}));

import request from 'supertest';
import { prisma } from '../../prisma/client';
import { createApp } from '../../app';
import * as taskerService from '../../modules/taskers/tasker.service';
import * as taskerTasksService from '../../modules/taskers/taskerTasks.service';

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Taskers API', () => {
  describe('POST /api/v1/taskers/apply', () => {
    it('submits application', async () => {
      (taskerService.applyAsTasker as jest.Mock).mockResolvedValue({
        message: 'Tasker application submitted',
        taskerProfile: { id: 'profile-1', verificationStatus: 'PENDING' },
      });

      const res = await request(app)
        .post('/api/v1/taskers/apply')
        .send({ vehicleType: 'MOTORCYCLE', experience: 3 });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('submitted');
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/api/v1/taskers/apply').send({});

      expect(res.status).toBe(400);
    });

    it('validates vehicle type', async () => {
      const res = await request(app).post('/api/v1/taskers/apply').send({ vehicleType: 'BUS' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/taskers/profile', () => {
    it('returns tasker profile', async () => {
      (taskerService.getProfile as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        verificationStatus: 'APPROVED',
        isOnline: true,
      });

      const res = await request(app).get('/api/v1/taskers/profile');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('profile-1');
    });
  });

  describe('PATCH /api/v1/taskers/status', () => {
    it('updates online status', async () => {
      (taskerService.updateStatus as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        isOnline: true,
      });

      const res = await request(app).patch('/api/v1/taskers/status').send({ isOnline: true });

      expect(res.status).toBe(200);
      expect(res.body.isOnline).toBe(true);
    });

    it('validates isOnline is boolean', async () => {
      const res = await request(app).patch('/api/v1/taskers/status').send({ isOnline: 'yes' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/taskers/tasks', () => {
    it('returns available tasks', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'profile-1' });
      (taskerTasksService.getAvailableTasks as jest.Mock).mockResolvedValue([
        {
          id: 'task-1',
          title: 'Available Task',
          offerPrice: 140,
          offerId: 'offer-1',
        },
      ]);

      const res = await request(app).get('/api/v1/taskers/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
