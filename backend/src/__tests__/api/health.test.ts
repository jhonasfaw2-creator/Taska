import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('Taska API');
  });

  it('returns JSON content type', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});
