import { PrismaClient } from '@prisma/client';
import { categories, subcategories } from './constants';

export async function createCategorySubCategory(prisma: PrismaClient) {
  const categoryCount = await prisma.category.count();
  const subcategoryCount = await prisma.subCategory.count();

  if (!(categoryCount && subcategoryCount)) {
    await prisma.category.deleteMany();
    await prisma.subCategory.deleteMany();

    await prisma.category.createMany({
      data: categories,
    });

    await prisma.subCategory.createMany({
      data: subcategories,
    });
  }
}
