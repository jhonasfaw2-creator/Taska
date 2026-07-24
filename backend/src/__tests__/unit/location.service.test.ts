import { validateCoordinates, haversineDistance } from '../../modules/location/location.service';

describe('Location Service', () => {
  describe('validateCoordinates', () => {
    it('allows valid coordinates', () => {
      expect(() => validateCoordinates(9.02, 38.75)).not.toThrow();
    });

    it('allows negative latitude', () => {
      expect(() => validateCoordinates(-33.8688, 151.2093)).not.toThrow();
    });

    it('allows valid boundary values', () => {
      expect(() => validateCoordinates(90, 180)).not.toThrow();
      expect(() => validateCoordinates(-90, -180)).not.toThrow();
    });

    it('throws for invalid latitude', () => {
      expect(() => validateCoordinates(100, 38.75)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(-100, 38.75)).toThrow('Latitude must be between -90 and 90');
    });

    it('throws for invalid longitude', () => {
      expect(() => validateCoordinates(9.02, 200)).toThrow(
        'Longitude must be between -180 and 180',
      );
      expect(() => validateCoordinates(9.02, -200)).toThrow(
        'Longitude must be between -180 and 180',
      );
    });

    it('rejects non-finite numbers', () => {
      expect(() => validateCoordinates(NaN, 38.75)).toThrow('Coordinates must be valid numbers');
      expect(() => validateCoordinates(9.02, Infinity)).toThrow(
        'Coordinates must be valid numbers',
      );
    });
  });

  describe('haversineDistance', () => {
    it('calculates 0 km for same point', () => {
      expect(haversineDistance(9.02, 38.75, 9.02, 38.75)).toBeCloseTo(0, 5);
    });

    it('calculates distance between two known points', () => {
      const distance = haversineDistance(9.02, 38.75, 8.9806, 38.7572);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10);
    });

    it('returns a positive number', () => {
      const distance = haversineDistance(0, 0, 1, 1);
      expect(distance).toBeGreaterThan(0);
    });

    it('is commutative', () => {
      const d1 = haversineDistance(9.02, 38.75, 8.9806, 38.7572);
      const d2 = haversineDistance(8.9806, 38.7572, 9.02, 38.75);
      expect(d1).toBeCloseTo(d2, 5);
    });
  });
});
