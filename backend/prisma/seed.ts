import { prisma } from '../src/prisma/client';
import bcrypt from 'bcryptjs';

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

const ADMIN_SEED = {
  phoneNumber: '+251911000000',
  firstName: 'Super',
  lastName: 'Admin',
  password: 'Admin@123456',
  role: 'SUPER_ADMIN' as const,
};

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

  // Seed initial SUPER_ADMIN admin user if none exists
  const existingAdmin = await prisma.adminUser.findFirst({
    include: { user: true },
  });
  if (!existingAdmin) {
    console.log('Seeding initial admin user...');
    const hashedPassword = await bcrypt.hash(ADMIN_SEED.password, 12);
    const user = await prisma.user.upsert({
      where: { phoneNumber: ADMIN_SEED.phoneNumber },
      update: {
        firstName: ADMIN_SEED.firstName,
        lastName: ADMIN_SEED.lastName,
        password: hashedPassword,
        isVerified: true,
        isOnboarded: true,
      },
      create: {
        phoneNumber: ADMIN_SEED.phoneNumber,
        firstName: ADMIN_SEED.firstName,
        lastName: ADMIN_SEED.lastName,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        isOnboarded: true,
      },
    });
    await prisma.adminUser.create({
      data: {
        userId: user.id,
        role: ADMIN_SEED.role,
        permissions: [],
      },
    });
    console.log(`Admin user created: ${ADMIN_SEED.phoneNumber} / ${ADMIN_SEED.password}`);
    console.log('⚠️  CHANGE THE DEFAULT PASSWORD IN PRODUCTION!');
  } else {
    console.log(`Admin user already exists: ${existingAdmin.user.phoneNumber}`);
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
