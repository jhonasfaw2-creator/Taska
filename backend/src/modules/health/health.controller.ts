import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { getHealthStatus } from './health.service';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = await getHealthStatus();
  const httpStatus = health.database.status === 'connected' ? 200 : 503;
  res.status(httpStatus).json(health);
});
