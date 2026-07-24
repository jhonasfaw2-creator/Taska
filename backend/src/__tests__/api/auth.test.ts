import { TEST_DB_URL } from '../helpers/db';
process.env.DATABASE_URL = TEST_DB_URL;

jest.mock('../../modules/auth/auth.service', () => ({
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
  refreshToken: jest.fn(),
}));

import request from 'supertest';
import { createApp } from '../../app';
import * as authService from '../../modules/auth/auth.service';

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/v1/auth/send-otp', () => {
  it('returns 200 on valid phone number', async () => {
    (authService.sendOtp as jest.Mock).mockResolvedValue({
      message: 'OTP sent',
      otp: '123456',
    });

    const res = await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phoneNumber: '+251911234567' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('OTP sent');
  });

  it('returns 400 on invalid phone number', async () => {
    const res = await request(app).post('/api/v1/auth/send-otp').send({ phoneNumber: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('returns 400 on missing phone number', async () => {
    const res = await request(app).post('/api/v1/auth/send-otp').send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/verify-otp', () => {
  it('returns 200 on valid OTP', async () => {
    (authService.verifyOtp as jest.Mock).mockResolvedValue({
      user: { phoneNumber: '+251911234567' },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    });

    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: '+251911234567', code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('access-token');
  });

  it('returns 400 on invalid code format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phoneNumber: '+251911234567', code: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/refresh-token', () => {
  it('returns 200 on valid refresh token', async () => {
    (authService.refreshToken as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
    });

    const res = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: 'valid-refresh-token' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('new-access-token');
  });

  it('returns 400 on missing refresh token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh-token').send({});

    expect(res.status).toBe(400);
  });
});
