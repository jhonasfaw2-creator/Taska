jest.mock('../../prisma/client', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../../prisma/client';
import { getRecentTasksByCustomer } from '../../modules/tasks/task.service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RecentTasksService', () => {
  it('returns recent tasks for customer', async () => {
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Recent Task',
        status: 'PENDING',
        estimatedPrice: 150.0,
        finalPrice: null,
        createdAt: new Date(),
        category: { name: 'Delivery' },
      },
    ];
    (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

    const result = await getRecentTasksByCustomer('customer-1');

    expect(result).toHaveLength(1);
    expect(result[0].categoryName).toBe('Delivery');
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { customerId: 'customer-1' } }),
    );
  });

  it('returns empty array when no tasks', async () => {
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getRecentTasksByCustomer('customer-1');

    expect(result).toHaveLength(0);
  });
});
