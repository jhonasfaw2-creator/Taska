import { AppError } from '../../common/errors';

export function validatePhoneNumber(phoneNumber: string): void {
  const phoneRegex = /^\+[1-9]\d{6,14}$/;

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new AppError('Phone number is required.', 400);
  }

  if (!phoneRegex.test(phoneNumber.trim())) {
    throw new AppError('Invalid phone number format. Use E.164 format (e.g. +251XXXXXXXXX).', 400);
  }
}

export function validateOtpCode(code: string): void {
  const otpRegex = /^\d{6}$/;

  if (!code || typeof code !== 'string') {
    throw new AppError('OTP code is required.', 400);
  }

  if (!otpRegex.test(code.trim())) {
    throw new AppError('OTP code must be exactly 6 digits.', 400);
  }
}

export function validateRefreshToken(token: string): void {
  if (!token || typeof token !== 'string') {
    throw new AppError('Refresh token is required.', 400);
  }
}
