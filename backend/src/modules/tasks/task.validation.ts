import { AppError } from '../../common/types';

const VALID_VEHICLE_TYPES = ['WALKING', 'MOTORCYCLE', 'CAR', 'VAN', 'TRUCK'] as const;

export interface CreateTaskInput {
  categoryId: string;
  title: string;
  description: string;
  specialInstructions?: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  vehicleType: string;
  estimatedPrice: number;
  imageUrls?: string[];
}

export function validateCreateTask(
  body: Record<string, unknown> | null | undefined,
): CreateTaskInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a valid JSON object.', 400);
  }
  const errors: string[] = [];

  const categoryId = body.categoryId;
  if (!categoryId || typeof categoryId !== 'string' || !categoryId.trim()) {
    errors.push('categoryId is required and must be a non-empty string.');
  }

  const title = body.title;
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('title is required and must be a non-empty string.');
  }

  const description = body.description;
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('description is required and must be a non-empty string.');
  }

  const pickupAddress = body.pickupAddress;
  if (!pickupAddress || typeof pickupAddress !== 'string' || !pickupAddress.trim()) {
    errors.push('pickupAddress is required and must be a non-empty string.');
  }

  const pickupLatitude = Number(body.pickupLatitude);
  if (!isFinite(pickupLatitude) || Math.abs(pickupLatitude) > 90) {
    errors.push('pickupLatitude must be a valid latitude between -90 and 90.');
  }

  const pickupLongitude = Number(body.pickupLongitude);
  if (!isFinite(pickupLongitude) || Math.abs(pickupLongitude) > 180) {
    errors.push('pickupLongitude must be a valid longitude between -180 and 180.');
  }

  const dropoffAddress = body.dropoffAddress;
  if (!dropoffAddress || typeof dropoffAddress !== 'string' || !dropoffAddress.trim()) {
    errors.push('dropoffAddress is required and must be a non-empty string.');
  }

  const dropoffLatitude = Number(body.dropoffLatitude);
  if (!isFinite(dropoffLatitude) || Math.abs(dropoffLatitude) > 90) {
    errors.push('dropoffLatitude must be a valid latitude between -90 and 90.');
  }

  const dropoffLongitude = Number(body.dropoffLongitude);
  if (!isFinite(dropoffLongitude) || Math.abs(dropoffLongitude) > 180) {
    errors.push('dropoffLongitude must be a valid longitude between -180 and 180.');
  }

  const vehicleType = body.vehicleType;
  if (!vehicleType || typeof vehicleType !== 'string') {
    errors.push('vehicleType is required.');
  } else if (
    !VALID_VEHICLE_TYPES.includes(vehicleType.toUpperCase() as (typeof VALID_VEHICLE_TYPES)[number])
  ) {
    errors.push(`vehicleType must be one of: ${VALID_VEHICLE_TYPES.join(', ')}.`);
  }

  const estimatedPrice = Number(body.estimatedPrice);
  if (!isFinite(estimatedPrice) || estimatedPrice < 0) {
    errors.push('estimatedPrice must be a non-negative number.');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }

  return {
    categoryId: categoryId as string,
    title: (title as string).trim(),
    description: (description as string).trim(),
    specialInstructions: body.specialInstructions
      ? String(body.specialInstructions).trim()
      : undefined,
    pickupAddress: (pickupAddress as string).trim(),
    pickupLatitude,
    pickupLongitude,
    dropoffAddress: (dropoffAddress as string).trim(),
    dropoffLatitude,
    dropoffLongitude,
    vehicleType: (vehicleType as string).toUpperCase(),
    estimatedPrice,
  };
}
