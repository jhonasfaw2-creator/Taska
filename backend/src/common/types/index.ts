import { AppError } from '../errors';

export { AppError };

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  corsOrigins: string[];
  logFormat: string;
  jwtSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  devMode: boolean;
  storageProvider: 'local' | 's3';
  uploadsDir: string;
  maxFileSize: number;
  s3: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
  };
  paymentProvider: string;
  platformFeePercentage: number;
}

export interface JwtPayload {
  userId: string;
  phoneNumber: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
}

export interface SendOtpInput {
  phoneNumber: string;
}

export interface VerifyOtpInput {
  phoneNumber: string;
  code: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}
