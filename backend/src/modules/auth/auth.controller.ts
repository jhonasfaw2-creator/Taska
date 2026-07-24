import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import * as authService from './auth.service';
import { validatePhoneNumber, validateOtpCode, validateRefreshToken } from './auth.validator';

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  console.log('[AuthController] POST /auth/send-otp received body:', JSON.stringify(req.body));
  const { phoneNumber } = req.body;

  console.log('[AuthController] Validating phone number:', phoneNumber);
  validatePhoneNumber(phoneNumber);
  console.log('[AuthController] Phone number valid');

  console.log('[AuthController] Calling authService.sendOtp...');
  const result = await authService.sendOtp(phoneNumber);
  console.log('[AuthController] authService.sendOtp result:', JSON.stringify(result));

  res.status(200).json({
    message: result.message,
    ...(result.otp ? { otp: result.otp } : {}),
  });
  console.log('[AuthController] Response sent successfully');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  console.log('[AuthController] POST /auth/verify-otp received body:', JSON.stringify(req.body));
  const { phoneNumber, code } = req.body;

  console.log('[AuthController] Validating phone number and code');
  validatePhoneNumber(phoneNumber);
  validateOtpCode(code);
  console.log('[AuthController] Validation passed');

  console.log('[AuthController] Calling authService.verifyOtp...');
  const result = await authService.verifyOtp(phoneNumber, code);
  console.log('[AuthController] verifyOtp result user:', result.user.phoneNumber);

  res.status(200).json({
    user: { phoneNumber: result.user.phoneNumber },
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
  console.log('[AuthController] Verify response sent successfully');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  validateRefreshToken(token);

  const result = await authService.refreshToken(token);

  res.status(200).json({ accessToken: result.accessToken });
});
