import { PrismaClient, UserType } from '@prisma/client';

// export async function createDriver(prisma: PrismaClient) {
//     const user = await prisma.user.findFirst({
//         where: {
//             email: 'driverone@mailinator.com',
//         },
//     });
//     if (!user) {
//         let data = {
//             email: 'driverone@mailinator.com',
//             password: await HashPassword('click123'),
//             name: 'User',
//             type: UserType.USER,
//             status: UserStatus.ACTIVE,
//             phone: '02134320437',
//             rideUserType: RideUserType.DRIVER,
//             settings: {},
//         };
//         await prisma.user.create({ data });
//     }
// }

// export async function createRider(prisma: PrismaClient) {
//     const user = await prisma.user.findFirst({
//         where: {
//             email: 'riderone@mailinator.com',
//         },
//     });
//     if (user) {
//         await prisma.user.update({
//             where: { id: 4 },
//             data: {
//                 email: 'riderone@mailinator.com',
//                 password: await HashPassword('click123'),
//                 name: 'User',
//                 type: UserType.USER,
//                 status: UserStatus.ACTIVE,
//                 phone: '02134320437',
//                 rideUserType: RideUserType.RIDER,
//             },
//         });
//     } else {
//         await prisma.user.create({
//             data: {
//                 email: 'riderone@mailinator.com',
//                 password: await HashPassword('click123'),
//                 name: 'User',
//                 type: UserType.USER,
//                 status: UserStatus.ACTIVE,
//                 phone: '02134320437',
//                 rideUserType: RideUserType.RIDER,
//             },
//         });
//     }
// }
