jest.mock('../../prisma/client', () => ({
  prisma: {
    taskerProfile: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../modules/tasks/task.service', () => ({
  getRecentTasksByCustomer: jest.fn(),
  createTask: jest.fn(),
  getMyTasks: jest.fn(),
  getTaskById: jest.fn(),
}));

jest.mock('../../modules/taskers/taskerTasks.service', () => ({
  acceptTask: jest.fn(),
}));

jest.mock('../../modules/tasks/taskStatus.service', () => ({
  updateTaskStatus: jest.fn(),
  getTaskStatusHistory: jest.fn(),
}));

jest.mock('../../common/middleware/auth.middleware', () => ({
  requireAuth: jest.fn((req: any, _res: any, next: any) => {
    req.user = { userId: 'user-1', phoneNumber: '+251911111111', role: 'CUSTOMER' };
    next();
  }),
}));

import request from 'supertest';
import { prisma } from '../../prisma/client';
import { createApp } from '../../app';
import * as taskService from '../../modules/tasks/task.service';
import * as taskerTasksService from '../../modules/taskers/taskerTasks.service';
import * as taskStatusService from '../../modules/tasks/taskStatus.service';

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Tasks API', () => {
  describe('GET /api/v1/tasks', () => {
    it('returns recent tasks', async () => {
      (taskService.getRecentTasksByCustomer as jest.Mock).mockResolvedValue([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Task',
          status: 'PENDING',
          estimatedPrice: 150,
          finalPrice: null,
          createdAt: '2026-07-21T08:00:00.000Z',
          categoryName: 'Delivery',
        },
      ]);

      const res = await request(app).get('/api/v1/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('creates a task for CUSTOMER role', async () => {
      (taskService.createTask as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        customerId: 'user-1',
        categoryId: 'cat-1',
        title: 'New Task',
        description: 'Description',
        status: 'PENDING',
        estimatedPrice: 150,
      });

      const res = await request(app).post('/api/v1/tasks').send({
        categoryId: 'cat-1',
        title: 'New Task',
        description: 'Description',
        pickupAddress: 'Addr',
        pickupLatitude: 9.0,
        pickupLongitude: 38.0,
        dropoffAddress: 'Addr2',
        dropoffLatitude: 9.0,
        dropoffLongitude: 38.0,
        vehicleType: 'MOTORCYCLE',
        estimatedPrice: 150,
      });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Task');
    });

    it('rejects non-CUSTOMER role', async () => {
      const { requireAuth } = require('../../common/middleware/auth.middleware');
      (requireAuth as jest.Mock).mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { userId: 'user-2', phoneNumber: '+251911111111', role: 'TASKER' };
        next();
      });

      const res = await request(app).post('/api/v1/tasks').send({
        categoryId: 'cat-1',
        title: 'New Task',
        description: 'Description',
        pickupAddress: 'Addr',
        pickupLatitude: 9.0,
        pickupLongitude: 38.0,
        dropoffAddress: 'Addr2',
        dropoffLatitude: 9.0,
        dropoffLongitude: 38.0,
        vehicleType: 'MOTORCYCLE',
        estimatedPrice: 150,
      });

      expect(res.status).toBe(403);
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/api/v1/tasks').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/tasks/my-tasks', () => {
    it('returns own tasks', async () => {
      (taskService.getMyTasks as jest.Mock).mockResolvedValue([
        { id: 'task-1', title: 'My Task', status: 'PENDING', categoryName: 'Delivery' },
      ]);

      const res = await request(app).get('/api/v1/tasks/my-tasks');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /api/v1/tasks/:taskId', () => {
    it('returns task by id', async () => {
      (taskService.getTaskById as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        status: 'PENDING',
        categoryName: 'Delivery',
      });

      const res = await request(app).get('/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('POST /api/v1/tasks/:taskId/accept', () => {
    it('accepts task by tasker', async () => {
      const { requireAuth } = require('../../common/middleware/auth.middleware');
      (requireAuth as jest.Mock).mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { userId: 'user-1', phoneNumber: '+251911111111', role: 'TASKER' };
        next();
      });
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'profile-1' });
      (taskerTasksService.acceptTask as jest.Mock).mockResolvedValue({
        message: 'Task accepted successfully',
        task: { id: 'task-1', status: 'ACCEPTED' },
      });

      const res = await request(app).post(
        '/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000/accept',
      );
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('accepted');
    });
  });

  describe('PATCH /api/v1/tasks/:taskId/status', () => {
    it('updates task status', async () => {
      (taskStatusService.updateTaskStatus as jest.Mock).mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'SEARCHING',
        previousStatus: 'PENDING',
        message: 'Status updated',
      });

      const res = await request(app)
        .patch('/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000/status')
        .send({ status: 'SEARCHING' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('SEARCHING');
    });

    it('validates status value', async () => {
      const res = await request(app)
        .patch('/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000/status')
        .send({ status: 'INVALID' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/tasks/:taskId/status-history', () => {
    it('returns status history', async () => {
      (taskStatusService.getTaskStatusHistory as jest.Mock).mockResolvedValue([
        { status: 'PENDING', changedBy: 'system', createdAt: '2026-07-21T08:00:00.000Z' },
      ]);

      const res = await request(app).get(
        '/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000/status-history',
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
