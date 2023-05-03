import { PrismaClient, UserType } from '@prisma/client';
import * as argon from 'argon2';

export async function createAdmin(prisma: PrismaClient) {
  await prisma.userMaster.upsert({
    where: {
      userMasterId: 1,
    },
    update: {
      email: 'clevis-admin@mailinator.com',
      // password: await HashPassword('click123'),
      password: await argon.hash('click123'),
      // name: 'Admin',
      userType: UserType.ADMIN,
      isEmailVerified: true,
      admin: {
        // upsert: {
        //   where: {
        //     id: 1,
        //   },
        //   update: {
        //     email: 'clevis-admin@mailinator.com',
        //     fullName: 'Admin',
        //   },
        create: {
          email: 'clevis-admin@mailinator.com',
          fullName: 'Admin',
        },
        // },
      },
    },
    create: {
      email: 'clevis-admin@mailinator.com',
      password: await argon.hash('click123'),
      userType: UserType.ADMIN,
      phone: '02134320437',
      location: 'location time',
    },
  });
}

// export async function createUser(prisma: PrismaClient) {
//     const user = await prisma.user.findFirst({
//         where: {
//             email: 'userone@mailinator.com',
//         },
//     });
//     if (!user) {
//         let data: any = {};
//         data = {
//             email: 'userone@mailinator.com',
//             password: await HashPassword('click123'),
//             name: 'User',
//             type: UserType.USER,
//             status: UserStatus.ACTIVE,
//             phone: '02134320437',
//             settings: {},
//         };
//         if (rideUserType) {
//             data.rideUserType = rideUserType;
//         }
//         await prisma.user.create({ data });
//     }
// }
