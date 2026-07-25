import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import { envConfig } from '../../common/config/env';
import { AppError, JwtPayload, TokenPair } from '../../common/types';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const generateOtp = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const createTokenPair = (payload: JwtPayload): TokenPair => {
  const accessToken = jwt.sign(payload, envConfig.jwtSecret, { expiresIn: '7d' });
  const refreshToken = jwt.sign(payload, envConfig.jwtSecret, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

export const sendOtp = async (phoneNumber: string) => {
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.user.upsert({
    where: { phoneNumber },
    update: { otp, otpExpiresAt, otpAttempts: 0 },
    create: { phoneNumber, otp, otpExpiresAt },
  });

  const message = envConfig.nodeEnv === 'development' ? `OTP sent: ${otp}` : 'OTP sent';

  return { message, otp: envConfig.nodeEnv === 'development' ? otp : undefined };
};

export const verifyOtp = async (phoneNumber: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { phoneNumber } });

  if (!user) {
    throw new AppError('User not found. Please request OTP first.', 404);
  }

  if (!user.otp || !user.otpExpiresAt) {
    throw new AppError('No OTP found. Please request a new OTP.', 400);
  }

  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new AppError('OTP attempts exceeded. Please request a new OTP.', 429);
  }

  if (Date.now() > user.otpExpiresAt.getTime()) {
    throw new AppError('OTP has expired. Please request a new OTP.', 410);
  }

  if (user.otp !== code) {
    await prisma.user.update({
      where: { phoneNumber },
      data: { otpAttempts: { increment: 1 } },
    });
    throw new AppError('Invalid OTP code. Please try again.', 401);
  }

  const tokenPayload: JwtPayload = {
    userId: user.id,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
  const tokens = createTokenPair(tokenPayload);

  await prisma.user.update({
    where: { phoneNumber },
    data: {
      otp: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      refreshToken: tokens.refreshToken,
      isOnboarded: user.isOnboarded,
    },
  });

  return { user, tokens };
};

export const refreshToken = async (token: string) => {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token has been revoked or user not found.', 401);
  }

  const tokenPayload: JwtPayload = {
    userId: user.id,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
  const accessToken = jwt.sign(tokenPayload, envConfig.jwtSecret, { expiresIn: '7d' });

  return { accessToken };
};
