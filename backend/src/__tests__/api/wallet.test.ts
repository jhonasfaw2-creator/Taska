import { TEST_DB_URL } from '../helpers/db';
process.env.DATABASE_URL = TEST_DB_URL;

jest.mock('../../modules/wallet/wallet.controller', () => ({
  getWallet: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: {
        id: 'wallet-1',
        taskerId: 'tasker-profile-1',
        balance: 1000,
        pendingBalance: 200,
        availableBalance: 800,
        totalEarned: 2000,
        totalWithdrawn: 1000,
        totalRefunded: 0,
        currency: 'ETB',
      },
    }),
  ),
  getBalanceSummary: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: {
        balance: 1000,
        pendingBalance: 200,
        availableBalance: 800,
        totalEarned: 2000,
        totalWithdrawn: 1000,
        totalRefunded: 0,
        withdrawable: 800,
        currency: 'ETB',
      },
    }),
  ),
  getTransactions: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { transactions: [], total: 0 } }),
  ),
  requestWithdrawal: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { balance: 700, withdrawn: 300 } }),
  ),
  getWalletByTaskerId: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: {
        id: 'wallet-1',
        taskerId: 'tasker-profile-1',
        balance: 1000,
        pendingBalance: 200,
        availableBalance: 800,
        totalEarned: 2000,
        totalWithdrawn: 1000,
        totalRefunded: 0,
        currency: 'ETB',
      },
    }),
  ),
}));

import request from 'supertest';
import { createApp } from '../../app';
import { generateTestToken } from '../helpers/auth';

const app = createApp();

describe('Wallet API – Authentication', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/v1/wallet');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});

describe('Wallet API – Balance & Summary', () => {
  it('returns wallet data', async () => {
    const token = generateTestToken();
    const res = await request(app).get('/api/v1/wallet').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.balance).toBe(1000);
    expect(res.body.data.currency).toBe('ETB');
  });

  it('returns balance summary', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/wallet/balance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.withdrawable).toBe(800);
    expect(res.body.data.availableBalance).toBe(800);
  });
});

describe('Wallet API – Transactions', () => {
  it('returns transaction history', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.transactions).toBeDefined();
  });

  it('respects pagination params', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/wallet/transactions?limit=10&offset=0')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Wallet API – Withdrawals', () => {
  it('processes withdrawal request', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .post('/api/v1/wallet/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 300 });
    expect(res.status).toBe(200);
    expect(res.body.data.withdrawn).toBe(300);
  });
});

describe('Wallet API – Admin', () => {
  it('returns 403 for non-admin accessing admin wallet endpoint', async () => {
    const token = generateTestToken({ role: 'CUSTOMER' });
    const res = await request(app)
      .get('/api/v1/wallet/admin/tasker-profile-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns wallet for admin', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/wallet/admin/tasker-profile-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.balance).toBe(1000);
  });
});
