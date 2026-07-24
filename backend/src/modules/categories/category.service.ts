import { prisma } from '../../prisma/client';

export interface CategoryResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
}

export const getCategories = async (): Promise<CategoryResult[]> => {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, description: true, iconUrl: true, sortOrder: true },
    orderBy: { sortOrder: 'asc' },
  });
  return categories;
};
