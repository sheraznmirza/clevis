import { PrismaClient } from '@prisma/client';
import { categories, services, subcategories } from './constants';

export async function createCategorySubCategory(prisma: PrismaClient) {
  const categoryCount = await prisma.category.count();
  const subcategoryCount = await prisma.subCategory.count();
  const serviceCount = await prisma.services.count();

  if (!(categoryCount && subcategoryCount && serviceCount)) {
    await prisma.category.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.services.deleteMany();

    await prisma.category.createMany({
      data: categories,
    });

    await prisma.subCategory.createMany({
      data: subcategories,
    });

    await prisma.services.createMany({
      data: services,
    });
  }
}
