import { config } from 'dotenv';
config();
//import { createAdmin } from './user';
import { PrismaClient } from '@prisma/client';
import { rolesCreate } from './role';
import { createCountryState } from './countrycity';
import { createCategorySubCategory } from './categorySubCategory';
// import { createRider } from './ride';
// import { createRolesAndPermissions } from './acl';
const prisma = new PrismaClient();

async function main() {
  console.log('--------------Seeding Start----------------');
  console.log('=======RolesSeeder=========');
  await rolesCreate(prisma);
  console.log('=======CountryCitySeeder=========');
  await createCountryState(prisma);
  console.log('=======AdminSeeder=========');
  // await createAdmin(prisma);
  console.log('=======CategorySubCategorySeeder=========');
  await createCategorySubCategory(prisma);
  // console.log('=======UserSeeder=========');
  //   createUser(prisma);
  //   console.log('=======DriverSeeder=========');
  //   createDriver(prisma);
  // console.log('=======RiderSeeder=========');
  //   createRider(prisma);
  // console.log('=======Role And Permissions Seeder=========');
  // createRolesAndPermissions(prisma);
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
