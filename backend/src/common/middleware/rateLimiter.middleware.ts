import rateLimit from 'express-rate-limit';
import { isProduction } from '../config/env';

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again later.' },
});
