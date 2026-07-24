jest.mock('../../prisma/client', () => ({
  prisma: {
    taskerProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../../prisma/client';
import * as taskerService from '../../modules/taskers/tasker.service';

const mockProfile = {
  id: 'profile-1',
  userId: 'user-1',
  verificationStatus: 'PENDING',
  rating: 0,
  totalTasksCompleted: 0,
  isOnline: false,
  bio: null,
  experience: null,
  lastActiveAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TaskerService', () => {
  describe('applyAsTasker', () => {
    it('creates a tasker profile and updates user role', async () => {
      (prisma.taskerProfile.create as jest.Mock).mockResolvedValue({
        ...mockProfile,
        vehicles: [],
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await taskerService.applyAsTasker({
        userId: 'user-1',
        vehicleType: 'MOTORCYCLE',
      });

      expect(result.taskerProfile).toBeDefined();
      expect(prisma.taskerProfile.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('throws if already applied', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      await expect(
        taskerService.applyAsTasker({ userId: 'user-1', vehicleType: 'MOTORCYCLE' }),
      ).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('returns the tasker profile', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      const result = await taskerService.getProfile('user-1');

      expect(result.id).toBe('profile-1');
    });

    it('throws if not found', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(taskerService.getProfile('user-none')).rejects.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('updates online status', async () => {
      (prisma.taskerProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.taskerProfile.update as jest.Mock).mockResolvedValue({
        ...mockProfile,
        isOnline: true,
      });

      const result = await taskerService.updateStatus({ userId: 'user-1', isOnline: true });

      expect(result.isOnline).toBe(true);
    });
  });
});
