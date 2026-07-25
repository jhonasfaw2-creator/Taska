import pino from 'pino';
import { envConfig } from '../config/env';

const level: string =
  envConfig.nodeEnv === 'test' ? 'silent' : envConfig.nodeEnv === 'production' ? 'info' : 'debug';

const transport =
  envConfig.nodeEnv !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined;

export const logger = pino({
  level,
  transport,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function childLogger(requestId: string) {
  return logger.child({ requestId });
}
