jest.mock('../../modules/categories/category.service', () => ({
  getCategories: jest.fn(),
}));

import request from 'supertest';
import { createApp } from '../../app';
import * as categoryService from '../../modules/categories/category.service';
import { generateTestToken } from '../helpers/auth';

const app = createApp();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/categories', () => {
  it('returns list of categories', async () => {
    (categoryService.getCategories as jest.Mock).mockResolvedValue([
      { id: 'cat-1', name: 'Delivery', description: 'Parcel delivery' },
      { id: 'cat-2', name: 'Grocery', description: 'Grocery shopping' },
    ]);

    const token = generateTestToken();
    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Delivery');
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(401);
  });
});
