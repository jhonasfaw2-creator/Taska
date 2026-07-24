import { TEST_DB_URL } from '../helpers/db';
process.env.DATABASE_URL = TEST_DB_URL;

jest.mock('../../modules/payment/payment.controller', () => ({
  createPayment: jest.fn((_req: any, res: any) =>
    res.status(201).json({ success: true, data: { id: 'payment-1', paymentStatus: 'PROCESSING' } }),
  ),
  confirmPayment: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'payment-1', paymentStatus: 'PAID' } }),
  ),
  cancelPayment: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'payment-1', paymentStatus: 'CANCELLED' } }),
  ),
  getPayment: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'payment-1', paymentStatus: 'PAID' } }),
  ),
  getPaymentByTask: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'payment-1', paymentStatus: 'PAID' } }),
  ),
  listPayments: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { payments: [], total: 0 } }),
  ),
  refundPayment: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'refund-1', amount: 50 } }),
  ),
  getPaymentAuditLogs: jest.fn((_req: any, res: any) => res.json({ success: true, data: [] })),
  listAllPayments: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { payments: [], total: 0 } }),
  ),
}));

import request from 'supertest';
import { createApp } from '../../app';
import { generateTestToken } from '../helpers/auth';

const app = createApp();

describe('Payment API – Authentication', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/v1/payments').send({ taskId: 'task-1', amount: 100 });
    expect(res.status).toBe(401);
  });

  it('returns 201 when creating a payment with valid token', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ taskId: 'task-1', amount: 100, currency: 'ETB' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe('PROCESSING');
  });

  it('rejects expired tokens', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', 'Bearer invalid-token')
      .send({ taskId: 'task-1', amount: 100 });
    expect(res.status).toBe(401);
  });
});

describe('Payment API – CRUD', () => {
  it('confirms a payment', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .post('/api/v1/payments/payment-1/confirm')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.paymentStatus).toBe('PAID');
  });

  it('cancels a payment', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .post('/api/v1/payments/payment-1/cancel')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.paymentStatus).toBe('CANCELLED');
  });

  it('gets payment by id', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/payments/payment-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('payment-1');
  });

  it('gets payment by task id', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/payments/task/task-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('payment-1');
  });

  it('lists payments', async () => {
    const token = generateTestToken();
    const res = await request(app).get('/api/v1/payments').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.payments).toBeDefined();
  });

  it('processes a refund', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .post('/api/v1/payments/payment-1/refund')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 50, reason: 'CUSTOMER_REQUEST' });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(50);
  });

  it('gets audit logs', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/payments/payment-1/audit-logs')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

describe('Payment API – Admin', () => {
  it('returns 403 for non-admin users accessing admin endpoints', async () => {
    const token = generateTestToken({ role: 'CUSTOMER' });
    const res = await request(app)
      .get('/api/v1/payments/admin/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 200 for admin users', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/payments/admin/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
