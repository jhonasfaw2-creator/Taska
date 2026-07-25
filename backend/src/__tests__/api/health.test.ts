import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('Taska API');
    expect(res.body.version).toBeDefined();
    expect(res.body.database.status).toBe('connected');
    expect(res.body.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(res.body.prisma.status).toBe('ready');
    expect(res.body.prisma.version).toBeDefined();
    expect(res.body.memory).toBeDefined();
    expect(res.body.memory.rss).toBeGreaterThan(0);
    expect(res.body.environment).toBeDefined();
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('returns JSON content type', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});
