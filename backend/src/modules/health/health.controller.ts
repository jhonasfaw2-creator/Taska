import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { getHealthStatus } from './health.service';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const status = await getHealthStatus();
  const httpStatus = status.database === 'unreachable' ? 503 : 200;
  res.status(httpStatus).json(status);
});
