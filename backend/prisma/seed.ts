import { prisma } from '../src/prisma/client';

const CATEGORIES = [
  { name: 'Delivery', slug: 'delivery', description: 'Package and item delivery', sortOrder: 1 },
  { name: 'Document Processing', slug: 'document-processing', description: 'Document handling and processing', sortOrder: 2 },
  { name: 'Shopping', slug: 'shopping', description: 'Personal shopping and errands', sortOrder: 3 },
  { name: 'Cleaning', slug: 'cleaning', description: 'Home and office cleaning', sortOrder: 4 },
  { name: 'Moving', slug: 'moving', description: 'Moving and relocation help', sortOrder: 5 },
  { name: 'Repair', slug: 'repair', description: 'Repair and maintenance', sortOrder: 6 },
  { name: 'Grocery', slug: 'grocery', description: 'Grocery shopping and delivery', sortOrder: 7 },
  { name: 'Pharmacy', slug: 'pharmacy', description: 'Pharmacy pickup and delivery', sortOrder: 8 },
  { name: 'Custom Task', slug: 'custom-task', description: 'Any other task you need help with', sortOrder: 9 },
];

async function main() {
  console.log('Seeding categories...');

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
