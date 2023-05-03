import { PrismaClient } from '@prisma/client';
import { roles } from './constants';

export async function rolesCreate(prisma: PrismaClient) {
  const rolesCount = await prisma.role.count();

  if (!rolesCount) {
    await prisma.role.deleteMany();

    await prisma.role.createMany({
      data: roles,
    });
  }
}
