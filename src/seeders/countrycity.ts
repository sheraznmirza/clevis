import { PrismaClient } from '@prisma/client';
// import countries from '../../data/countries.json'
import * as countries from '../../data/countries.json';
import * as states from '../../data/states.json';
import * as cities from '../../data/cities.json';

export async function countryCity(prisma: PrismaClient) {
  const countryCount = await prisma.country.count();
  const stateCount = await prisma.state.count();
  const cityCount = await prisma.city.count();

  if (!(cityCount && stateCount && countryCount)) {
    await prisma.city.deleteMany();
    await prisma.state.deleteMany();
    await prisma.country.deleteMany();

    await prisma.country.createMany({
      data: countries,
    });

    await prisma.state.createMany({
      data: states,
    });

    // await prisma.city.createMany({
    //   data: cities,
    // });
  }

  // await prisma.userMaster.upsert({
  //   where: {
  //     userMasterId: 1,
  //   },
  //   update: {
  //     email: 'clevis-admin@mailinator.com',
  //     // password: await argon.hash('click123'),
  //     // name: 'Admin',
  //     userType: UserType.ADMIN,
  //     isEmailVerified: true,
  //     admin: {
  //       // upsert: {
  //       //   where: {
  //       //     id: 1,
  //       //   },
  //       //   update: {
  //       //     email: 'clevis-admin@mailinator.com',
  //       //     fullName: 'Admin',
  //       //   },
  //       create: {
  //         email: 'clevis-admin@mailinator.com',
  //         fullName: 'Admin',
  //       },
  //       // },
  //     },
  //   },
  //   create: {
  //     email: 'clevis-admin@mailinator.com',
  //     password: await argon.hash('click123'),
  //     userType: UserType.ADMIN,
  //     phone: '02134320437',
  //     location: 'location time',
  //   },
  // });
}
