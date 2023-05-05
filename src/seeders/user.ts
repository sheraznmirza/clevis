import { PrismaClient, UserType } from '@prisma/client';
import * as argon from 'argon2';

export async function createAdmin(prisma: PrismaClient) {
  await prisma.userMaster.create({
    data: {
      email: 'admin@clevis.com',
      password: await argon.hash('click123'),
      userType: UserType.ADMIN,
      phone: '123456789',
      isEmailVerified: true,
      roleId: 1,
      admin: {
        create: {
          email: 'admin@clevis.com',
          fullName: 'Admin',
        },
      },
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
