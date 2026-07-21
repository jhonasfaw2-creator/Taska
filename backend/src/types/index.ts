// ─── Application Error ──────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ─── API response envelope ──────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Environment variables shape ───────────────────────
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
}

// ─── Auth ───────────────────────────────────────────────
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
