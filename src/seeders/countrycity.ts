import { PrismaClient } from '@prisma/client';
// import countries from '../../data/countries.json'
import countries from '../../data/countries.json';
import states from '../../data/states.json';

export async function createCountryState(prisma: PrismaClient) {
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
}
