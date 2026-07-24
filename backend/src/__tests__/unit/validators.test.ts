import { AppError } from '../../common/errors';
import {
  validatePhoneNumber,
  validateOtpCode,
  validateRefreshToken,
} from '../../modules/auth/auth.validator';

import { validateCreateTask } from '../../modules/tasks/task.validation';

import { validateApply, validateStatus } from '../../modules/taskers/tasker.validation';

describe('Auth Validators', () => {
  describe('validatePhoneNumber', () => {
    it('accepts valid E.164 phone numbers', () => {
      expect(() => validatePhoneNumber('+251911234567')).not.toThrow();
      expect(() => validatePhoneNumber('+12025551234')).not.toThrow();
    });

    it('rejects missing phone number', () => {
      expect(() => validatePhoneNumber('')).toThrow(AppError);
      expect(() => validatePhoneNumber(null as any)).toThrow(AppError);
    });

    it('rejects invalid format', () => {
      expect(() => validatePhoneNumber('0911234567')).toThrow(AppError);
      expect(() => validatePhoneNumber('+251')).toThrow(AppError);
      expect(() => validatePhoneNumber('abc')).toThrow(AppError);
    });
  });

  describe('validateOtpCode', () => {
    it('accepts 6-digit codes', () => {
      expect(() => validateOtpCode('123456')).not.toThrow();
    });

    it('rejects non-6-digit codes', () => {
      expect(() => validateOtpCode('12345')).toThrow(AppError);
      expect(() => validateOtpCode('1234567')).toThrow(AppError);
      expect(() => validateOtpCode('')).toThrow(AppError);
      expect(() => validateOtpCode(null as any)).toThrow(AppError);
    });
  });

  describe('validateRefreshToken', () => {
    it('accepts non-empty string', () => {
      expect(() => validateRefreshToken('some-token')).not.toThrow();
    });

    it('rejects empty or missing token', () => {
      expect(() => validateRefreshToken('')).toThrow(AppError);
      expect(() => validateRefreshToken(null as any)).toThrow(AppError);
    });
  });
});

describe('Task Validators', () => {
  describe('validateCreateTask', () => {
    const validInput = {
      categoryId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Test Task',
      description: 'Test description',
      pickupAddress: '123 Test St',
      pickupLatitude: 9.0227,
      pickupLongitude: 38.7468,
      dropoffAddress: '456 Test Ave',
      dropoffLatitude: 9.0082,
      dropoffLongitude: 38.7614,
      vehicleType: 'MOTORCYCLE',
      estimatedPrice: 150.0,
    };

    it('accepts valid input', () => {
      const result = validateCreateTask(validInput);
      expect(result.vehicleType).toBe('MOTORCYCLE');
    });

    it('rejects missing required fields', () => {
      expect(() => validateCreateTask({} as any)).toThrow(AppError);
    });

    it('rejects invalid vehicle type', () => {
      expect(() => validateCreateTask({ ...validInput, vehicleType: 'HELICOPTER' })).toThrow(
        AppError,
      );
    });

    it('rejects negative price', () => {
      expect(() => validateCreateTask({ ...validInput, estimatedPrice: -10 })).toThrow(AppError);
    });

    it('rejects invalid coordinate ranges', () => {
      expect(() => validateCreateTask({ ...validInput, pickupLatitude: 100 })).toThrow(AppError);
      expect(() => validateCreateTask({ ...validInput, pickupLongitude: 200 })).toThrow(AppError);
    });

    it('accepts optional specialInstructions', () => {
      const result = validateCreateTask({ ...validInput, specialInstructions: 'Ring the bell' });
      expect(result.specialInstructions).toBe('Ring the bell');
    });
  });
});

describe('Tasker Validators', () => {
  describe('validateApply', () => {
    it('accepts valid application', () => {
      const result = validateApply({ vehicleType: 'MOTORCYCLE', experience: 3, bio: 'Hi' });
      expect(result.vehicleType).toBe('MOTORCYCLE');
    });

    it('rejects missing vehicle type', () => {
      expect(() => validateApply({} as any)).toThrow(AppError);
    });

    it('rejects invalid vehicle type', () => {
      expect(() => validateApply({ vehicleType: 'BUS' })).toThrow(AppError);
    });

    it('rejects non-object body', () => {
      expect(() => validateApply(null)).toThrow(AppError);
    });
  });

  describe('validateStatus', () => {
    it('accepts valid status input', () => {
      const result = validateStatus({ isOnline: true });
      expect(result.isOnline).toBe(true);
    });

    it('rejects non-boolean isOnline', () => {
      expect(() => validateStatus({ isOnline: 'yes' } as any)).toThrow(AppError);
    });

    it('rejects missing body', () => {
      expect(() => validateStatus(null)).toThrow(AppError);
    });
  });
});

describe('AppError', () => {
  it('creates operational error with status code', () => {
    const error = new AppError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('defaults to 500 when not specified', () => {
    const error = new AppError('Server error', 500);
    expect(error.statusCode).toBe(500);
  });
});
