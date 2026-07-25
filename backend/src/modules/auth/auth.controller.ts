import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { logger } from '../../common/utils/logger';
import * as authService from './auth.service';
import { validatePhoneNumber, validateOtpCode, validateRefreshToken } from './auth.validator';

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  logger.debug('POST /auth/send-otp — sendOtp');
  const { phoneNumber } = req.body;

  logger.debug('Validating phone number');
  validatePhoneNumber(phoneNumber);

  logger.debug('Calling authService.sendOtp');
  const result = await authService.sendOtp(phoneNumber);

  res.status(200).json({
    message: result.message,
    ...(result.otp ? { otp: result.otp } : {}),
  });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  logger.debug('POST /auth/verify-otp — verifyOtp');
  const { phoneNumber, code } = req.body;

  validatePhoneNumber(phoneNumber);
  validateOtpCode(code);

  logger.debug('Validation passed, calling authService.verifyOtp');
  const result = await authService.verifyOtp(phoneNumber, code);

  res.status(200).json({
    user: { phoneNumber: result.user.phoneNumber },
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  validateRefreshToken(token);

  const result = await authService.refreshToken(token);

  res.status(200).json({ accessToken: result.accessToken });
});
