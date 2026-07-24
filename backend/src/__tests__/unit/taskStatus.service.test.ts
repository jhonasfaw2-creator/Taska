const mockTx = {
  task: { update: jest.fn() },
  taskStatusHistory: { create: jest.fn() },
};

jest.mock('../../prisma/client', () => ({
  prisma: {
    task: { findUnique: jest.fn(), update: jest.fn() },
    taskStatusHistory: { create: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn((cb: any) => cb(mockTx)),
  },
}));

jest.mock('../../common/socket', () => ({
  emitToTask: jest.fn(),
}));

import { prisma } from '../../prisma/client';
import * as taskStatusService from '../../modules/tasks/taskStatus.service';

const mockTask = {
  id: 'task-1',
  customerId: 'user-customer',
  taskerId: 'profile-tasker',
  categoryId: 'cat-1',
  title: 'Test Task',
  description: 'Test',
  pickupAddress: 'Addr',
  pickupLatitude: 9.0,
  pickupLongitude: 38.0,
  dropoffAddress: 'Addr2',
  dropoffLatitude: 9.0,
  dropoffLongitude: 38.0,
  vehicleType: 'MOTORCYCLE',
  estimatedPrice: 100.0,
  finalPrice: null,
  specialInstructions: null,
  status: 'PENDING',
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfile = {
  id: 'profile-tasker',
  userId: 'user-tasker',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TaskStatusService', () => {
  describe('updateTaskStatus', () => {
    it('transitions PENDING -> SEARCHING for customer', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      mockTx.task.update.mockResolvedValue({ ...mockTask, status: 'SEARCHING' });

      const result = await taskStatusService.updateTaskStatus(
        'task-1',
        'SEARCHING',
        'user-customer',
        'CUSTOMER',
        mockProfile,
      );

      expect(result.status).toBe('SEARCHING');
    });

    it('throws on invalid transition PENDING -> COMPLETED', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      await expect(
        taskStatusService.updateTaskStatus(
          'task-1',
          'COMPLETED',
          'user-customer',
          'CUSTOMER',
          mockProfile,
        ),
      ).rejects.toThrow();
    });

    it('throws if task not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        taskStatusService.updateTaskStatus(
          'task-none',
          'SEARCHING',
          'user-customer',
          'CUSTOMER',
          mockProfile,
        ),
      ).rejects.toThrow();
    });

    it('throws on terminal status update', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({ ...mockTask, status: 'COMPLETED' });

      await expect(
        taskStatusService.updateTaskStatus(
          'task-1',
          'CANCELLED',
          'user-customer',
          'CUSTOMER',
          mockProfile,
        ),
      ).rejects.toThrow();
    });

    it('throws on role not allowed', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      await expect(
        taskStatusService.updateTaskStatus(
          'task-1',
          'PICKED_UP',
          'user-customer',
          'CUSTOMER',
          mockProfile,
        ),
      ).rejects.toThrow();
    });
  });

  describe('getTaskStatusHistory', () => {
    it('returns status history for a task', async () => {
      const history = [
        { status: 'PENDING', changedBy: 'system', createdAt: new Date() },
        { status: 'SEARCHING', changedBy: 'customer', createdAt: new Date() },
      ];
      (prisma.taskStatusHistory.findMany as jest.Mock).mockResolvedValue(history);

      const result = await taskStatusService.getTaskStatusHistory('task-1');

      expect(result).toHaveLength(2);
    });
  });
});
