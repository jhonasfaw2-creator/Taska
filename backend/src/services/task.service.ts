import { prisma } from '../prisma/client';

export interface RecentTaskResult {
  id: string;
  title: string;
  status: string;
  estimatedPrice: number;
  finalPrice: number | null;
  createdAt: string;
  categoryName: string;
}

export async function getRecentTasksByCustomer(
  customerId: string,
  limit = 10,
): Promise<RecentTaskResult[]> {
  const tasks = await prisma.task.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      estimatedPrice: true,
      finalPrice: true,
      createdAt: true,
      category: {
        select: { name: true },
      },
    },
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    estimatedPrice: Number(t.estimatedPrice),
    finalPrice: t.finalPrice ? Number(t.finalPrice) : null,
    createdAt: t.createdAt.toISOString(),
    categoryName: t.category.name,
  }));
}
