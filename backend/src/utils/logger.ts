import morgan from 'morgan';
import { envConfig } from '../config/env';

/**
 * HTTP request logger (Morgan) stream configured via LOG_FORMAT env.
 * In production, use 'combined' for Apache-style logs.
 * In development, use 'dev' for concise coloured output.
 */
export const httpLogger = morgan(envConfig.logFormat, {
  skip: (_req, res) => res.statusCode < 400 && envConfig.nodeEnv === 'test',
});
