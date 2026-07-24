import { AppError } from '../../common/types';

const VALID_VEHICLE_TYPES = ['WALKING', 'MOTORCYCLE', 'CAR', 'VAN', 'TRUCK'] as const;

export interface ApplyInput {
  vehicleType: string;
  experience?: number;
  bio?: string;
}

export interface StatusInput {
  isOnline: boolean;
}

export function validateApply(body: Record<string, unknown> | null | undefined): ApplyInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a valid JSON object.', 400);
  }
  const errors: string[] = [];

  const vehicleType = body.vehicleType;
  if (!vehicleType || typeof vehicleType !== 'string') {
    errors.push('vehicleType is required.');
  } else if (
    !VALID_VEHICLE_TYPES.includes(vehicleType.toUpperCase() as (typeof VALID_VEHICLE_TYPES)[number])
  ) {
    errors.push(`vehicleType must be one of: ${VALID_VEHICLE_TYPES.join(', ')}.`);
  }

  if (body.experience !== undefined && body.experience !== null) {
    const exp = Number(body.experience);
    if (!Number.isInteger(exp) || exp < 0) {
      errors.push('experience must be a non-negative integer.');
    }
  }

  if (body.bio !== undefined && body.bio !== null) {
    if (typeof body.bio !== 'string') {
      errors.push('bio must be a string.');
    }
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }

  return {
    vehicleType: (vehicleType as string).toUpperCase(),
    experience:
      body.experience !== undefined && body.experience !== null
        ? Number(body.experience)
        : undefined,
    bio: body.bio !== undefined && body.bio !== null ? String(body.bio).trim() : undefined,
  };
}

export function validateStatus(body: Record<string, unknown> | null | undefined): StatusInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a valid JSON object.', 400);
  }
  if (typeof body.isOnline !== 'boolean') {
    throw new AppError('isOnline must be a boolean.', 400);
  }

  return { isOnline: body.isOnline };
}
