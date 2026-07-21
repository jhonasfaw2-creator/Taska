import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/auth.service';
import {
  validatePhoneNumber,
  validateOtpCode,
  validateRefreshToken,
} from '../validators/auth.validator';

/**
 * POST /api/v1/auth/send-otp
 *
 * Request:  { "phoneNumber": "+251XXXXXXXXX" }
 * Response: { "message": "OTP sent", "otp": "123456" }
 *
 * The `otp` field is only present in development mode.
 * In production, only `message` is returned.
 */
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

/**
 * POST /api/v1/auth/verify-otp
 *
 * Request:  { "phoneNumber": "+251XXXXXXXXX", "code": "123456" }
 * Response: { "user": { "phoneNumber": "+251..." }, "accessToken": "xxxxx", "refreshToken": "yyyyy" }
 */
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

/**
 * POST /api/v1/auth/refresh-token
 *
 * Request:  { "refreshToken": "..." }
 * Response: { "accessToken": "..." }
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  validateRefreshToken(token);

  const result = await authService.refreshToken(token);

  res.status(200).json({ accessToken: result.accessToken });
});
