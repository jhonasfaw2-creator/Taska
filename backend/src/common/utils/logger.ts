import pino from 'pino';
import { envConfig } from '../config/env';

export const logger = pino({
  level:
    envConfig.nodeEnv === 'test' ? 'silent' : envConfig.nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    envConfig.nodeEnv !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
