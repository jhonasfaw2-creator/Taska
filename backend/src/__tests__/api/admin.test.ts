import { TEST_DB_URL } from '../helpers/db';
process.env.DATABASE_URL = TEST_DB_URL;

jest.mock('../../modules/admin/admin.controller', () => ({
  login: jest.fn((req: any, res: any) =>
    res.json({
      success: true,
      data: {
        token: 'admin-jwt-token',
        user: {
          id: 'admin-1',
          phoneNumber: '+251911000000',
          role: 'SUPER_ADMIN',
          permissions: ['all'],
        },
      },
    }),
  ),
  getDashboardStats: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: {
        totalUsers: 100,
        activeCustomers: 60,
        activeTaskers: 40,
        onlineTaskers: 15,
        tasksToday: 25,
        tasksInProgress: 10,
        completedTasks: 500,
        cancelledTasks: 20,
        pendingVerifications: 5,
        revenueToday: 1500,
        revenueThisMonth: 45000,
        totalWalletBalance: 50000,
        totalPendingBalance: 10000,
        totalAvailableBalance: 40000,
      },
    }),
  ),
  getUserGrowth: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: [
        { date: '2026-07-01', value: 5 },
        { date: '2026-07-02', value: 8 },
      ],
    }),
  ),
  getTaskGrowth: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: [
        { date: '2026-07-01', value: 3 },
        { date: '2026-07-02', value: 6 },
      ],
    }),
  ),
  getRevenueGrowth: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: [
        { date: '2026-07-01', value: 1000 },
        { date: '2026-07-02', value: 1500 },
      ],
    }),
  ),
  getTaskCategoryDistribution: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: [
        { name: 'Delivery', count: 150 },
        { name: 'Grocery', count: 80 },
      ],
    }),
  ),
  listUsers: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { users: [], total: 0 } }),
  ),
  getUserDetails: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: { id: 'user-1', firstName: 'Test', phoneNumber: '+251911111111' },
    }),
  ),
  updateUser: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'user-1', firstName: 'Updated' } }),
  ),
  suspendUser: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'user-1', deletedAt: new Date().toISOString() } }),
  ),
  reactivateUser: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'user-1', deletedAt: null } }),
  ),
  deleteUser: jest.fn((_req: any, res: any) =>
    res.json({ success: true, message: 'User deleted.' }),
  ),
  listTasks: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { tasks: [], total: 0 } }),
  ),
  getTaskDetails: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'task-1', title: 'Test Task', status: 'PENDING' } }),
  ),
  cancelTask: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'task-1', status: 'CANCELLED' } }),
  ),
  reassignTask: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'task-1', taskerId: 'new-tasker-1' } }),
  ),
  listTaskers: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { taskers: [], total: 0 } }),
  ),
  getTaskerDetails: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: { id: 'tasker-1', user: { firstName: 'Tasker', lastName: 'One' } },
    }),
  ),
  approveTasker: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'tasker-1', verificationStatus: 'APPROVED' } }),
  ),
  rejectTasker: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'tasker-1', verificationStatus: 'REJECTED' } }),
  ),
  suspendTaskerSubmit: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'tasker-1', verificationStatus: 'SUSPENDED' } }),
  ),
  listAdminPayments: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { payments: [], total: 0 } }),
  ),
  getAdminPaymentDetails: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'payment-1', amount: 100, paymentStatus: 'PAID' } }),
  ),
  processRefund: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'refund-1', amount: 50 } }),
  ),
  listWallets: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { wallets: [], total: 0 } }),
  ),
  sendNotification: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'notif-1', title: 'Test' } }),
  ),
  broadcastNotification: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { sentCount: 50 } }),
  ),
  getRevenueReport: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { totalRevenue: 50000, totalFees: 5000, count: 100 } }),
  ),
  getUsersReport: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { total: 100, customers: 60, taskers: 40 } }),
  ),
  getTasksReport: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { total: 200, byStatus: { PENDING: 50, COMPLETED: 150 } } }),
  ),
  getPaymentsReport: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { total: 150, totalRevenue: 50000, totalFees: 5000 } }),
  ),
  exportReport: jest.fn((_req: any, res: any) =>
    res.setHeader('Content-Type', 'text/csv').send('date,value\n2026-07-01,1000\n'),
  ),
  listAuditLogs: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { logs: [], total: 0 } }),
  ),
  listAdminUsers: jest.fn((_req: any, res: any) =>
    res.json({
      success: true,
      data: [
        { id: 'admin-1', role: 'SUPER_ADMIN', user: { firstName: 'Super', lastName: 'Admin' } },
      ],
    }),
  ),
  createAdminUser: jest.fn((_req: any, res: any) =>
    res.status(201).json({ success: true, data: { id: 'admin-2', role: 'MODERATOR' } }),
  ),
  updateAdminRole: jest.fn((_req: any, res: any) =>
    res.json({ success: true, data: { id: 'admin-1', role: 'ADMIN' } }),
  ),
  removeAdmin: jest.fn((_req: any, res: any) =>
    res.json({ success: true, message: 'Admin removed.' }),
  ),
}));

import request from 'supertest';
import { createApp } from '../../app';
import { generateTestToken } from '../helpers/auth';

const app = createApp();

describe('Admin API – Authentication', () => {
  it('returns 200 on admin login', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ phoneNumber: '+251911000000', password: 'Admin@123456' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('admin-jwt-token');
  });

  it('returns 401 without auth token on protected routes', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard/stats');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin users', async () => {
    const token = generateTestToken({ role: 'CUSTOMER' });
    const res = await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('Admin API – Dashboard', () => {
  it('returns dashboard stats', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBe(100);
  });

  it('returns user growth data', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/dashboard/user-growth?days=30')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('Admin API – User Management', () => {
  it('lists users', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('gets user details', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/users/user-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('suspends user', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/users/user-1/suspend')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.deletedAt).toBeDefined();
  });

  it('reactivates user', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/users/user-1/reactivate')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.deletedAt).toBeNull();
  });
});

describe('Admin API – Task Management', () => {
  it('lists tasks', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('cancels a task', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/tasks/task-1/cancel')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Admin override' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });
});

describe('Admin API – Tasker Management', () => {
  it('approves a tasker', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/taskers/tasker-1/approve')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.verificationStatus).toBe('APPROVED');
  });

  it('rejects a tasker', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/taskers/tasker-1/reject')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.verificationStatus).toBe('REJECTED');
  });
});

describe('Admin API – Payments & Refunds', () => {
  it('lists payments', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/payments')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('processes a refund', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/payments/payment-1/refund')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 50, reason: 'CUSTOMER_REQUEST' });
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(50);
  });
});

describe('Admin API – Notifications', () => {
  it('sends a notification to a user', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/notifications/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 'user-1', title: 'Test', message: 'Hello' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Test');
  });

  it('broadcasts notification', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/notifications/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Broadcast', message: 'To all users', roleFilter: 'ALL' });
    expect(res.status).toBe(200);
    expect(res.body.data.sentCount).toBe(50);
  });
});

describe('Admin API – Audit Logs', () => {
  it('lists audit logs', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.logs).toBeDefined();
  });
});

describe('Admin API – Admin User Management', () => {
  it('lists admin users', async () => {
    const token = generateTestToken({ role: 'ADMIN', adminRole: 'SUPER_ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('creates a new admin user', async () => {
    const token = generateTestToken({ role: 'ADMIN', adminRole: 'SUPER_ADMIN' });
    const res = await request(app)
      .post('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 'user-2', role: 'MODERATOR' });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('MODERATOR');
  });
});

describe('Admin API – Reports', () => {
  it('gets revenue report', async () => {
    const token = generateTestToken({ role: 'ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/reports/revenue')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalRevenue).toBe(50000);
  });
});

describe('Admin API – Permissions by Role', () => {
  it('allows SUPER_ADMIN access to sensitive endpoints', async () => {
    const token = generateTestToken({ role: 'ADMIN', adminRole: 'SUPER_ADMIN' });
    const res = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('denies MODERATOR access to sensitive endpoints', async () => {
    const token = generateTestToken({ role: 'ADMIN', adminRole: 'MODERATOR' });
    const res = await request(app)
      .get('/api/v1/admin/admins')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
