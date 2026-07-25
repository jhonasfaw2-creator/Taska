jest.mock('../../prisma/client', () => ({
  prisma: {
    taskerProfile: { findUnique: jest.fn(), findMany: jest.fn() },
    task: { findMany: jest.fn() },
  },
}));

import { prisma } from '../../prisma/client';
import { findMatchingTasks, findMatchingTaskers } from '../../modules/matching/matching.service';

const mockTask = {
  id: 'task-1',
  customerId: 'customer-1',
  taskerId: null,
  categoryId: 'cat-1',
  title: 'Test Task',
  description: 'Test description',
  status: 'SEARCHING',
  pickupAddress: 'Bole, Addis Ababa',
  pickupLatitude: 9.02,
  pickupLongitude: 38.75,
  dropoffAddress: 'Kazanchis, Addis Ababa',
  dropoffLatitude: 9.01,
  dropoffLongitude: 38.76,
  vehicleType: 'CAR',
  estimatedPrice: 150.0,
  finalPrice: null,
  specialInstructions: null,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MatchingService', () => {
  describe('findMatchingTasks', () => {
    it('returns tasks within radius for verified online tasker', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        latitude: 9.02,
        longitude: 38.75,
        verificationStatus: 'APPROVED',
        isOnline: true,
        userId: 'user-1',
      });

      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        {
          ...mockTask,
          category: { name: 'Delivery' },
          customer: { ratingSummary: { averageRating: 4.5 } },
        },
      ]);

      const result = await findMatchingTasks({
        taskerProfileId: 'profile-1',
        radiusKm: 50,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
      expect(result[0].distanceKm).toBeGreaterThanOrEqual(0);
      expect(result[0].customerRating).toBe(4.5);
      expect(result[0].categoryName).toBe('Delivery');
    });

    it('filters tasks by vehicle type', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        latitude: 9.02,
        longitude: 38.75,
        verificationStatus: 'APPROVED',
        isOnline: true,
        userId: 'user-1',
      });

      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        {
          ...mockTask,
          vehicleType: 'MOTORCYCLE',
          category: { name: 'Delivery' },
          customer: { ratingSummary: null },
        },
      ]);

      const result = await findMatchingTasks({
        taskerProfileId: 'profile-1',
        radiusKm: 50,
        vehicleType: 'MOTORCYCLE',
      });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicleType: 'MOTORCYCLE',
          }),
        }),
      );
    });

    it('throws for unverified taskers', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        latitude: 9.02,
        longitude: 38.75,
        verificationStatus: 'PENDING',
        isOnline: true,
        userId: 'user-1',
      });

      await expect(
        findMatchingTasks({ taskerProfileId: 'profile-1', radiusKm: 10 }),
      ).rejects.toThrow('verified');
    });

    it('returns empty array when tasker has no location', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        latitude: null,
        longitude: null,
        verificationStatus: 'APPROVED',
        isOnline: true,
        userId: 'user-1',
      });

      const result = await findMatchingTasks({
        taskerProfileId: 'profile-1',
        radiusKm: 10,
      });

      expect(result).toEqual([]);
    });
  });

  describe('findMatchingTaskers', () => {
    it('returns taskers within radius', async () => {
      (prisma.taskerProfile.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'tasker-1',
          userId: 'user-1',
          latitude: 9.03,
          longitude: 38.74,
          rating: 4.5,
          totalTasksCompleted: 10,
          isOnline: true,
          verificationStatus: 'APPROVED',
          user: { firstName: 'John', lastName: 'Doe' },
          vehicles: [{ type: 'CAR' }],
        },
      ]);

      const result = await findMatchingTaskers({
        latitude: 9.02,
        longitude: 38.75,
        radiusKm: 50,
      });

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
      expect(result[0].distance).toBeGreaterThanOrEqual(0);
    });

    it('filters only online and approved taskers', async () => {
      (prisma.taskerProfile.findMany as jest.Mock).mockResolvedValue([]);

      await findMatchingTaskers({
        latitude: 9.02,
        longitude: 38.75,
        radiusKm: 10,
      });

      expect(prisma.taskerProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isOnline: true,
            verificationStatus: 'APPROVED',
          }),
        }),
      );
    });
  });
});
