import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('Analytics API', () => {
  describe('GET /api/v1/analytics/users', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/v1/analytics/users');
      expect(res.status).toBe(401);
    });

    it('returns 401 with malformed auth header', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/users')
        .set('Authorization', 'InvalidFormat');
      expect(res.status).toBe(401);
    });
  });
});