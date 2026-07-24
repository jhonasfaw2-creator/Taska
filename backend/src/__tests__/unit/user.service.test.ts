jest.mock('../../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../../prisma/client';
import * as userService from '../../modules/users/user.service';

const mockProfile = {
  id: 'user-1',
  phoneNumber: '+251911111111',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  profileImage: null,
  role: 'CUSTOMER',
  createdAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UserService', () => {
  describe('getProfile', () => {
    it('returns user profile', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockProfile,
        isOnboarded: true,
      });

      const result = await userService.getProfile({
        userId: 'user-1',
        phoneNumber: '+251911111111',
        role: 'CUSTOMER',
      });

      expect(result.phoneNumber).toBe('+251911111111');
    });

    it('throws if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.getProfile({
          userId: 'user-none',
          phoneNumber: '+251911111111',
          role: 'CUSTOMER',
        }),
      ).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('updates profile fields', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockProfile,
        firstName: 'Updated',
        isOnboarded: true,
      });

      const result = await userService.updateProfile(
        { userId: 'user-1', phoneNumber: '+251911111111', role: 'CUSTOMER' },
        { firstName: 'Updated' },
      );

      expect(result.firstName).toBe('Updated');
    });
  });

  describe('updateRole', () => {
    it('updates role to TASKER', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phoneNumber: '+251911111111',
        role: 'TASKER',
      });

      const result = await userService.updateRole(
        { userId: 'user-1', phoneNumber: '+251911111111', role: 'CUSTOMER' },
        'TASKER',
      );

      expect(result.role).toBe('TASKER');
    });

    it('throws on invalid role', async () => {
      await expect(
        userService.updateRole(
          { userId: 'user-1', phoneNumber: '+251911111111', role: 'CUSTOMER' },
          'INVALID',
        ),
      ).rejects.toThrow();
    });
  });
});
