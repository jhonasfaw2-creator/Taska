jest.mock('../../prisma/client', () => ({
  prisma: {
    category: { findUnique: jest.fn() },
    task: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  },
}));

jest.mock('../../common/config/env', () => ({
  envConfig: { jwtSecret: 'test-secret', nodeEnv: 'test' },
}));

jest.mock('../../common/socket', () => ({
  emitToUser: jest.fn(),
}));

import { prisma } from '../../prisma/client';
import * as tasksService from '../../modules/tasks/task.service';

const mockTask = {
  id: 'task-1',
  customerId: 'user-1',
  categoryId: 'cat-1',
  title: 'Test Task',
  description: 'Test description',
  specialInstructions: null,
  pickupAddress: '123 Test St',
  pickupLatitude: 9.0227,
  pickupLongitude: 38.7468,
  dropoffAddress: '456 Test Ave',
  dropoffLatitude: 9.0082,
  dropoffLongitude: 38.7614,
  vehicleType: 'MOTORCYCLE',
  estimatedPrice: 150.0,
  finalPrice: null,
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TasksService', () => {
  describe('createTask', () => {
    const input = {
      categoryId: 'cat-1',
      title: 'Test Task',
      description: 'Test description',
      pickupAddress: '123 Test St',
      pickupLatitude: 9.0227,
      pickupLongitude: 38.7468,
      dropoffAddress: '456 Test Ave',
      dropoffLatitude: 9.0082,
      dropoffLongitude: 38.7614,
      vehicleType: 'MOTORCYCLE' as const,
      estimatedPrice: 150.0,
    };

    it('creates a task and returns it', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 'cat-1' });
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await tasksService.createTask('user-1', input);

      expect(result.id).toBe('task-1');
      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ customerId: 'user-1' }),
        }),
      );
    });

    it('throws if category not found', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tasksService.createTask('user-1', input)).rejects.toThrow();
    });
  });

  describe('getTaskById', () => {
    it('returns task with category name', async () => {
      const taskWithCategory = {
        ...mockTask,
        category: { name: 'Delivery' },
      };
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(taskWithCategory);

      const result = await tasksService.getTaskById('task-1');

      expect(result.categoryName).toBe('Delivery');
    });

    it('throws if task not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tasksService.getTaskById('task-xxx')).rejects.toThrow();
    });
  });

  describe('getMyTasks', () => {
    it('returns tasks for the user', async () => {
      const tasks = [
        {
          ...mockTask,
          category: { name: 'Delivery' },
        },
      ];
      (prisma.task.findMany as jest.Mock).mockResolvedValue(tasks);

      const result = await tasksService.getMyTasks('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].categoryName).toBe('Delivery');
    });
  });
});
