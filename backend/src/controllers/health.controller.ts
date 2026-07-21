import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getHealthStatus } from '../services/health.service';

/**
 * GET /api/v1/health
 *
 * Returns a lightweight health-check payload so load balancers,
 * orchestrators, and monitoring tools can verify the service is alive.
 * Business logic is delegated to the health service.
 */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getHealthStatus();
  res.status(200).json(data);
});
