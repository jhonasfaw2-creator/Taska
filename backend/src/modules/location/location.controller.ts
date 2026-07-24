import { Request, Response, NextFunction } from 'express';
import { findNearbyTaskers, findNearbyTasks, validateCoordinates } from './location.service';
import { AppError } from '../../common/errors';
export class LocationController {
  static async getNearbyTaskers(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { lat, lng, radius, vehicleType } = req.query;

    if (!lat || !lng || !radius) {
      throw new AppError('lat, lng, and radius are required.', 400);
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusKm = Number(radius);

    validateCoordinates(latitude, longitude);

    if (radiusKm <= 0 || radiusKm > 100) {
      throw new AppError('Radius must be between 0.1 and 100 km.', 400);
    }

    const taskers = await findNearbyTaskers({
      latitude,
      longitude,
      radiusKm,
      vehicleType: typeof vehicleType === 'string' ? vehicleType : undefined,
    });

    res.json({
      success: true,
      data: taskers,
    });
  }

  static async getNearbyTasks(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { lat, lng, radius, status } = req.query;

    if (!lat || !lng || !radius) {
      throw new AppError('lat, lng, and radius are required.', 400);
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusKm = Number(radius);

    validateCoordinates(latitude, longitude);

    if (radiusKm <= 0 || radiusKm > 100) {
      throw new AppError('Radius must be between 0.1 and 100 km.', 400);
    }

    const tasks = await findNearbyTasks({
      latitude,
      longitude,
      radiusKm,
      status: typeof status === 'string' ? status : 'SEARCHING',
    });

    res.json({
      success: true,
      data: tasks,
    });
  }
}
