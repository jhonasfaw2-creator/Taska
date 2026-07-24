const mockTx = {
  task: { update: jest.fn() },
  taskOffer: { update: jest.fn(), updateMany: jest.fn() },
  taskStatusHistory: { create: jest.fn() },
};

jest.mock('../../prisma/client', () => ({
  prisma: {
    taskerProfile: { findUnique: jest.fn() },
    task: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    taskOffer: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    taskStatusHistory: { create: jest.fn() },
    $transaction: jest.fn((cb: any) => cb(mockTx)),
  },
}));

jest.mock('../../common/socket', () => ({
  emitToTask: jest.fn(),
}));

import { prisma } from '../../prisma/client';
import * as taskerTasksService from '../../modules/taskers/taskerTasks.service';

const mockTask = {
  id: 'task-1',
  customerId: 'customer-1',
  taskerId: null,
  categoryId: 'cat-1',
  title: 'Test Task',
  description: 'Test',
  status: 'PENDING',
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
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TaskerTasksService', () => {
  describe('getAvailableTasks', () => {
    it('returns available tasks with offers', async () => {
      (prisma.taskOffer.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'offer-1',
          price: 90.0,
          status: 'PENDING',
          task: {
            ...mockTask,
            category: { name: 'Delivery' },
            customer: {
              receivedReviews: [{ rating: 5 }, { rating: 4 }],
            },
          },
        },
      ]);

      const result = await taskerTasksService.getAvailableTasks('profile-1');

      expect(result).toHaveLength(1);
      expect(result[0].offerId).toBe('offer-1');
      expect(result[0].offerPrice).toBe(90);
    });
  });

  describe('acceptTask', () => {
    it('accepts a task with pending offer', async () => {
      (prisma.taskOffer.findFirst as jest.Mock).mockResolvedValue({
        id: 'offer-1',
        price: 90,
        status: 'PENDING',
        task: { ...mockTask, status: 'PENDING', taskerId: null },
      });
      mockTx.task.update.mockResolvedValue({
        ...mockTask,
        status: 'ACCEPTED',
        taskerId: 'profile-1',
      });
      mockTx.taskOffer.update.mockResolvedValue({});
      mockTx.taskOffer.updateMany.mockResolvedValue({ count: 0 });
      mockTx.taskStatusHistory.create.mockResolvedValue({});

      const result = await taskerTasksService.acceptTask('profile-1', 'task-1');

      expect(result.task.status).toBe('ACCEPTED');
    });

    it('throws if no pending offer', async () => {
      (prisma.taskOffer.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(taskerTasksService.acceptTask('profile-1', 'task-1')).rejects.toThrow();
    });
  });
});
