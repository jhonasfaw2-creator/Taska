import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { envConfig } from '../config/env';
import { AppError, JwtPayload, TokenPair } from '../types';

// ─── Constants ─────────────────────────────────────────
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

// ─── Helpers ───────────────────────────────────────────

/**
 * Generate a cryptographically-secure N-digit OTP code.
 */
function generateOtpCode(): string {
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  // Ensure a 6-digit code (100000 – 999999)
  return String((num % 900000) + 100000);
}

/**
 * Sign a JWT access or refresh token.
 */
function signToken(payload: JwtPayload, expiresIn: string): string {
  return jwt.sign(payload, envConfig.jwtSecret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token.
 */
function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}

// ─── Public API ────────────────────────────────────────

/**
 * Generate and persist a 6-digit OTP for the given phone number.
 *
 * In development mode the OTP code is included in the return value
 * so that front-end engineers can test without a real SMS provider.
 *
 * @todo Integrate an SMS provider (e.g. Twilio, Vonage, Africa's Talking)
 *       to deliver the OTP to the user in production.
 */
export async function sendOtp(
  phoneNumber: string,
): Promise<{ message: string; otp?: string }> {
  console.log('[AuthService.sendOtp] Received request for:', phoneNumber);

  // ── Invalidate any previous unverified OTPs for this number ──
  console.log('[AuthService.sendOtp] Invalidating old OTPs...');
  const invalidateResult = await prisma.oTPVerification.updateMany({
    where: {
      phoneNumber,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    data: {
      expiresAt: new Date(), // Expire them immediately
    },
  });
  console.log('[AuthService.sendOtp] Invalidated', invalidateResult.count, 'old OTP(s)');

  // ── Generate & persist the new OTP ────────────────────
  const code = generateOtpCode();
  console.log('[AuthService.sendOtp] Generated OTP code:', code);
  console.log('[AuthService.sendOtp] devMode:', envConfig.devMode);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  console.log('[AuthService.sendOtp] Saving OTP to database...');
  await prisma.oTPVerification.create({
    data: {
      phoneNumber,
      code,
      expiresAt,
      attempts: 0,
    },
  });
  console.log('[AuthService.sendOtp] OTP saved successfully');

  // ── Return (include OTP in dev mode for testing) ──────
  const result: { message: string; otp?: string } = {
    message: 'OTP sent successfully',
  };

  if (envConfig.devMode) {
    result.otp = code;
    console.log('[AuthService.sendOtp] Including OTP in response (dev mode)');
  }

  console.log('[AuthService.sendOtp] Returning result:', JSON.stringify(result));
  return result;
}

/**
 * Verify the OTP code, create a user account if one does not already
 * exist for the phone number, and return a signed token pair.
 */
export async function verifyOtp(
  phoneNumber: string,
  code: string,
): Promise<{ user: { id: string; phoneNumber: string; role: string }; tokens: TokenPair }> {
  // ── Find the most-recent unverified OTP for this number ──
  const otpRecord = await prisma.oTPVerification.findFirst({
    where: {
      phoneNumber,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new AppError('No valid OTP found. Please request a new code.', 400);
  }

  // ── Check attempts ────────────────────────────────────
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    // Expire the record so the user must request a fresh OTP
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { expiresAt: new Date() },
    });
    throw new AppError(
      'Too many failed attempts. Please request a new OTP.',
      429,
    );
  }

  // ── Verify the code ───────────────────────────────────
  if (otpRecord.code !== code) {
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;
    throw new AppError(
      `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      401,
    );
  }

  // ── Mark OTP as verified ──────────────────────────────
  await prisma.oTPVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // ── Find or create user ──────────────────────────────
  let user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phoneNumber,
        firstName: 'User',   // Placeholder — updated during profile setup
        lastName: '',         // Placeholder — updated during profile setup
        isVerified: true,
      },
    });
  } else {
    // Ensure the existing user is marked as verified
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }

  // ── Generate tokens ──────────────────────────────────
  const jwtPayload: JwtPayload = {
    userId: user.id,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };

  const tokens: TokenPair = {
    accessToken: signToken(jwtPayload, envConfig.jwtAccessExpiresIn),
    refreshToken: signToken(jwtPayload, envConfig.jwtRefreshExpiresIn),
  };

  return {
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    tokens,
  };
}

/**
 * Issue a new access token from a valid refresh token.
 */
export async function refreshToken(
  token: string,
): Promise<{ accessToken: string }> {
  const decoded = verifyToken(token);

  // Ensure the user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, phoneNumber: true, role: true, deletedAt: true },
  });

  if (!user || user.deletedAt) {
    throw new AppError('User not found or deactivated.', 401);
  }

  const jwtPayload: JwtPayload = {
    userId: user.id,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };

  const accessToken = signToken(jwtPayload, envConfig.jwtAccessExpiresIn);

  return { accessToken };
}
