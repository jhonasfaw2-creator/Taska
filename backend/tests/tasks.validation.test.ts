import { validateCreateTask } from '../src/modules/tasks/tasks.validation';
import { AppError } from '../src/types';

const validBody = {
  categoryId: 'cat-1',
  title: 'Deliver documents',
  description: 'Pick up an envelope and drop it off.',
  pickupAddress: 'Bole, Addis Ababa',
  pickupLatitude: 9.01,
  pickupLongitude: 38.76,
  dropoffAddress: 'Piassa, Addis Ababa',
  dropoffLatitude: 9.03,
  dropoffLongitude: 38.75,
  vehicleType: 'motorcycle',
  estimatedPrice: 150,
};

describe('validateCreateTask', () => {
  it('returns a normalized task for a valid body', () => {
    const result = validateCreateTask(validBody);
    expect(result.vehicleType).toBe('MOTORCYCLE');
    expect(result.title).toBe('Deliver documents');
    expect(result.estimatedPrice).toBe(150);
  });

  it('trims whitespace from string fields', () => {
    const result = validateCreateTask({ ...validBody, title: '  Deliver  ' });
    expect(result.title).toBe('Deliver');
  });

  it('rejects a missing body', () => {
    expect(() => validateCreateTask(null)).toThrow(AppError);
  });

  it('rejects an out-of-range latitude', () => {
    expect(() => validateCreateTask({ ...validBody, pickupLatitude: 200 })).toThrow(AppError);
  });

  it('rejects an unknown vehicle type', () => {
    expect(() => validateCreateTask({ ...validBody, vehicleType: 'rocket' })).toThrow(AppError);
  });

  it('rejects a negative price', () => {
    expect(() => validateCreateTask({ ...validBody, estimatedPrice: -5 })).toThrow(AppError);
  });
});
