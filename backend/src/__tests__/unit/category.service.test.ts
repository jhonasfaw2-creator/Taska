jest.mock('../../prisma/client', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../../prisma/client';
import { getCategories } from '../../modules/categories/category.service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CategoryService', () => {
  it('returns all categories ordered by sortOrder', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Delivery', slug: 'delivery', description: 'Parcel delivery', iconUrl: null, sortOrder: 1 },
      { id: 'cat-2', name: 'Grocery', slug: 'grocery', description: 'Grocery shopping', iconUrl: null, sortOrder: 2 },
    ];
    (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

    const result = await getCategories();

    expect(result).toHaveLength(2);
    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { sortOrder: 'asc' } }),
    );
    expect(result[0].slug).toBe('delivery');
  });

  it('returns empty array when no categories', async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getCategories();

    expect(result).toHaveLength(0);
  });
});
