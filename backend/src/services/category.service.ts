import { prisma } from '../prisma/client';

export interface CategoryResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
}

export async function getActiveCategories(): Promise<CategoryResult[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      iconUrl: true,
      sortOrder: true,
    },
  });
  return categories;
}
