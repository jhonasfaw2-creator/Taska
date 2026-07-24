import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('GET /api/docs', () => {
  it('returns Swagger UI page', async () => {
    const res = await request(app).get('/api/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger');
  });
});
