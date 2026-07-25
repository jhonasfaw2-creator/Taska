import { AppError } from '../../common/errors';

jest.mock('../../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('../../common/config/env', () => ({
  envConfig: {
    jwtSecret: 'test-secret',
    nodeEnv: 'development',
    databaseUrl: 'test',
    corsOrigins: [],
    logFormat: 'dev',
    devMode: true,
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(() => ({ userId: 'user-1', phoneNumber: '+251911111111' })),
}));

import { prisma } from '../../prisma/client';
import * as authService from '../../modules/auth/auth.service';

const mockUser = {
  id: 'user-1',
  phoneNumber: '+251911111111',
  firstName: 'Test',
  lastName: 'User',
  email: null,
  profileImage: null,
  role: 'CUSTOMER',
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  isOnboarded: false,
  otp: '123456',
  otpExpiresAt: new Date(Date.now() + 300_000),
  otpAttempts: 0,
  refreshToken: 'old-refresh-token',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthService', () => {
  describe('sendOtp', () => {
    it('creates a new user and returns OTP in dev mode', async () => {
      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.sendOtp('+251911111111');

      expect(result.message).toContain('OTP sent');
      expect(result.otp).toBeDefined();
      expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
    });

    it('updates existing user and returns OTP', async () => {
      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.sendOtp('+251911111111');

      expect(result.message).toContain('OTP sent');
      expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyOtp', () => {
    it('throws if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyOtp('+251911111111', '123456')).rejects.toThrow(AppError);
    });

    it('throws if OTP not set', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        otp: null,
        otpExpiresAt: null,
      });

      await expect(authService.verifyOtp('+251911111111', '123456')).rejects.toThrow(AppError);
    });

    it('throws if OTP expired', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        otpExpiresAt: new Date(Date.now() - 60_000),
      });

      await expect(authService.verifyOtp('+251911111111', '123456')).rejects.toThrow(AppError);
    });

    it('throws if OTP attempts exceeded', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        otpAttempts: 5,
      });

      await expect(authService.verifyOtp('+251911111111', '123456')).rejects.toThrow(AppError);
    });

    it('throws on wrong OTP code', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.verifyOtp('+251911111111', '000000')).rejects.toThrow(AppError);
    });

    it('returns tokens on successful verification', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.verifyOtp('+251911111111', '123456');

      expect(result.tokens).toBeDefined();
    });
  });

  describe('refreshToken', () => {
    it('throws on invalid token', async () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt error');
      });

      await expect(authService.refreshToken('bad-token')).rejects.toThrow(AppError);
    });

    it('returns new access token on valid refresh token', async () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ userId: 'user-1', phoneNumber: '+251911111111' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        refreshToken: 'valid-refresh-token',
      });

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBeDefined();
    });
  });
});
