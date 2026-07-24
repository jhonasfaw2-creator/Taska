jest.mock('../../modules/media/media.service', () => {
  const mockMediaRecord = {
    id: 'media-uuid-123',
    originalName: 'test-image.png',
    mimeType: 'image/png',
    size: 1024,
    width: 100,
    height: 100,
    folder: 'task-images',
    filename: 'unique-filename.png',
    url: '/uploads/task-images/unique-filename.png',
    uploadedById: 'user-id-123',
    createdAt: new Date().toISOString(),
  };

  return {
    MediaService: jest.fn().mockImplementation(() => ({
      uploadSingle: jest.fn().mockResolvedValue(mockMediaRecord),
      uploadMultiple: jest
        .fn()
        .mockResolvedValue([mockMediaRecord, { ...mockMediaRecord, id: 'media-uuid-456' }]),
      delete: jest.fn().mockResolvedValue(undefined),
      getById: jest
        .fn()
        .mockImplementation((id: string) =>
          id === 'media-uuid-123' ? Promise.resolve(mockMediaRecord) : Promise.resolve(null),
        ),
      getByFolder: jest.fn().mockResolvedValue([mockMediaRecord]),
      getByUser: jest.fn().mockResolvedValue([mockMediaRecord]),
    })),
  };
});

import request from 'supertest';
import { createApp } from '../../app';
import { generateTestToken } from '../helpers/auth';

const app = createApp();
const authToken = generateTestToken({ userId: 'user-id-123', role: 'CUSTOMER' });

describe('POST /api/v1/media/upload', () => {
  it('uploads an image successfully', async () => {
    const res = await request(app)
      .post('/api/v1/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('fake-image'), 'test-image.png', {
        contentType: 'image/png',
      })
      .field('folder', 'task-images');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      originalName: 'test-image.png',
      mimeType: 'image/png',
      folder: 'task-images',
    });
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/v1/media/upload')
      .attach('file', Buffer.from('test'), 'test.png')
      .field('folder', 'task-images');

    expect(res.status).toBe(401);
  });

  it('rejects requests without a file', async () => {
    const res = await request(app)
      .post('/api/v1/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .field('folder', 'task-images');

    expect(res.status).toBe(400);
  });

  it('rejects invalid folder', async () => {
    const res = await request(app)
      .post('/api/v1/media/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('test'), 'test.png')
      .field('folder', 'invalid-folder');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid folder');
  });
});

describe('POST /api/v1/media/upload-multiple', () => {
  it('uploads multiple images successfully', async () => {
    const res = await request(app)
      .post('/api/v1/media/upload-multiple')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('files', Buffer.from('img1'), 'img1.png')
      .attach('files', Buffer.from('img2'), 'img2.png')
      .field('folder', 'task-images');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('rejects upload without files', async () => {
    const res = await request(app)
      .post('/api/v1/media/upload-multiple')
      .set('Authorization', `Bearer ${authToken}`)
      .field('folder', 'task-images');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/media/:id', () => {
  it('returns media metadata by id', async () => {
    const res = await request(app)
      .get('/api/v1/media/media-uuid-123')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('media-uuid-123');
  });

  it('returns 404 for non-existent media', async () => {
    const res = await request(app)
      .get('/api/v1/media/non-existent-id')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/media/:id', () => {
  it('deletes a media record', async () => {
    const res = await request(app)
      .delete('/api/v1/media/media-uuid-123')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/media', () => {
  it('lists media by folder', async () => {
    const res = await request(app)
      .get('/api/v1/media?folder=task-images')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('rejects invalid folder filter', async () => {
    const res = await request(app)
      .get('/api/v1/media?folder=invalid-folder')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
  });
});
