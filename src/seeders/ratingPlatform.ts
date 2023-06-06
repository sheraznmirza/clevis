import { PrismaClient, ServiceType } from '@prisma/client';

export async function platformSeed(prisma: PrismaClient) {
  await prisma.platformSetup.create({
    data: {
      fee: 1,
    },
  });
}

export async function ratingSeed(prisma: PrismaClient) {
  await prisma.ratingSetup.createMany({
    data: [
      {
        rating: 50,
        serviceType: ServiceType.CAR_WASH,
      },
      {
        rating: 50,
        serviceType: ServiceType.LAUNDRY,
      },
    ],
  });
}
