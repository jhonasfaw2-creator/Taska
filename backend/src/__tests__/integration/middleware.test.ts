import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../common/config/env';

jest.mock('../../prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-1',
        phoneNumber: '+251911111111',
        role: 'CUSTOMER',
      }),
    },
  },
}));

import { requireAuth } from '../../common/middleware/auth.middleware';
import { notFoundHandler } from '../../common/middleware/notFound.middleware';
import { globalErrorHandler } from '../../common/middleware/error.middleware';
import { AppError } from '../../common/errors';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { Prisma } from '@prisma/client';

describe('Auth Middleware', () => {
  function createTestApp() {
    const app = express();
    app.use(express.json());
    app.get('/protected', requireAuth, (_req: Request, res: Response) => {
      res.json({ userId: (_req as any).user?.userId, role: (_req as any).user?.role });
    });
    return app;
  }

  it('rejects requests without Authorization header', async () => {
    const app = createTestApp();
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  it('rejects expired tokens', async () => {
    const token = jwt.sign(
      { userId: 'u1', phoneNumber: '+251911111111', role: 'CUSTOMER' },
      envConfig.jwtSecret,
      { expiresIn: '0s' },
    );
    const app = createTestApp();
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('rejects malformed Authorization header', async () => {
    const app = createTestApp();
    const res = await request(app).get('/protected').set('Authorization', 'InvalidHeader');
    expect(res.status).toBe(401);
  });

  it('accepts valid token and attaches user', async () => {
    const token = jwt.sign(
      { userId: 'u1', phoneNumber: '+251911111111', role: 'CUSTOMER' },
      envConfig.jwtSecret,
      { expiresIn: '1h' },
    );
    const app = createTestApp();
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('u1');
  });
});

describe('Error Middleware', () => {
  function createTestApp() {
    const app = express();
    app.get(
      '/operational',
      asyncHandler(async () => {
        throw new AppError('Bad request', 400);
      }),
    );
    app.get(
      '/unknown',
      asyncHandler(async () => {
        throw new Error('Unexpected');
      }),
    );
    app.get(
      '/prisma-p2002',
      asyncHandler(async () => {
        throw new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.0',
        });
      }),
    );
    app.get(
      '/prisma-p2025',
      asyncHandler(async () => {
        throw new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0',
        });
      }),
    );
    app.use(notFoundHandler);
    app.use(globalErrorHandler);
    return app;
  }

  it('handles AppError with correct status code', async () => {
    const app = createTestApp();
    const res = await request(app).get('/operational');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Bad request');
  });

  it('handles unknown errors as 500', async () => {
    const app = createTestApp();
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(500);
  });

  it('handles Prisma P2002 unique constraint as 409', async () => {
    const app = createTestApp();
    const res = await request(app).get('/prisma-p2002');
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already exists');
  });

  it('handles Prisma P2025 not found as 404', async () => {
    const app = createTestApp();
    const res = await request(app).get('/prisma-p2025');
    expect(res.status).toBe(404);
  });

  it('handles 404 for unknown routes', async () => {
    const app = createTestApp();
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('Async Handler', () => {
  it('catches rejected promises and forwards to next', async () => {
    const app = express();
    app.get(
      '/async-error',
      asyncHandler(async () => {
        throw new AppError('Async error', 422);
      }),
    );
    app.use(globalErrorHandler);

    const res = await request(app).get('/async-error');
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Async error');
  });
});
