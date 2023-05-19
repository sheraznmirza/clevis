import { config } from 'dotenv';
config();
//import { createAdmin } from './user';
import { PrismaClient } from '@prisma/client';
import { createRiders, createVendors } from './user';
// import { createRider } from './ride';
// import { createRolesAndPermissions } from './acl';
const prisma = new PrismaClient();

async function main() {
  console.log('--------------Seeding Part 2 Start----------------');
  console.log('=======VendorSeeder=========');
  await createVendors(prisma);
  console.log('=======RiderSeeder=========');
  await createRiders(prisma);
}

main()
  .then(async () => {
    console.log('------------Seeding done!-------------');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
