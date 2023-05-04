import { PrismaClient, UserType } from '@prisma/client';
// import { genSalt, hash } from 'bcrypt-nodejs';
// import { inArray } from 'helpers/util.helper';

// async function getPermissions(prisma: PrismaClient): Promise<any> {
//     const permissions: any = [
//         {
//             action: 'ACCESS_ALL',
//             object: 'ACCESS_ALL',
//         },
//         {
//             action: 'ALL',
//             object: 'DEMO',
//         },
//         {
//             action: 'READ',
//             object: 'DEMO',
//         },
//         {
//             action: 'CREATE',
//             object: 'DEMO',
//         },
//         {
//             action: 'UPDATE',
//             object: 'DEMO',
//         },
//         {
//             action: 'DELETE',
//             object: 'DEMO',
//         },
//     ];
//     return await prisma.$transaction(
//         permissions.map((permission: any) => prisma.permission.create({ data: { ...permission } })),
//     );
// }

// async function createAdmin(prisma: PrismaClient, adminRoleId: number) {
//     const admin = await prisma.user.findUnique({ where: { id: 1 } });
//     if (admin) {
//         await prisma.user.update({
//             where: { email: 'koderlabs.admin@mailinator.com' },
//             data: {
//                 email: 'koderlabs.admin@mailinator.com',
//                 password: await HashPassword('click123'),
//                 name: 'Admin',
//                 type: UserType.ADMIN,
//                 status: UserStatus.ACTIVE,
//                 phone: '02134320437',
//             },
//         });
//         const getRole = await prisma.userRole.findFirst({
//             where: { userId: 1 },
//         });
//         if (!getRole) {
//             await prisma.userRole.create({
//                 data: {
//                     userId: 1,
//                     roleId: adminRoleId,
//                 },
//             });
//         } else {
//             await prisma.userRole.update({
//                 where: { id: getRole.id },
//                 data: {
//                     userId: 1,
//                 },
//             });
//         }
//     } else {
//         await prisma.user.create({
//             data: {
//                 email: 'koderlabs.admin@mailinator.com',
//                 password: await HashPassword('click123'),
//                 name: 'Admin',
//                 type: UserType.ADMIN,
//                 status: UserStatus.ACTIVE,
//                 phone: '02134320437',
//                 settings: {
//                     create: {},
//                 },
//             },
//         });
//         await prisma.userRole.create({
//             data: {
//                 userId: 1,
//                 roleId: adminRoleId,
//             },
//         });
//     }
// }

// async function createUser(prisma: PrismaClient, userRoleId: number) {
//     const user = await prisma.user.findUnique({ where: { id: 2 } });
//     if (user) {
//         await prisma.user.update({
//             where: { email: 'userone@mailinator.com' },
//             data: {
//                 email: 'userone@mailinator.com',
//                 password: await HashPassword('click123'),
//                 name: 'User',
//                 type: UserType.USER,
//                 status: UserStatus.ACTIVE,
//                 phone: '02134320437',
//             },
//         });
//         const getRole = await prisma.userRole.findFirst({
//             where: { userId: 2 },
//         });
//         if (!getRole) {
//             await prisma.userRole.create({
//                 data: {
//                     userId: 2,
//                     roleId: userRoleId,
//                 },
//             });
//         } else {
//             await prisma.userRole.update({
//                 where: { id: getRole.id },
//                 data: {
//                     userId: 2,
//                 },
//             });
//         }
//     } else {
//         await prisma.user.create({
//             data: {
//                 email: 'userone@mailinator.com',
//                 password: await HashPassword('click123'),
//                 name: 'User',
//                 type: UserType.USER,
//                 status: UserStatus.ACTIVE,
//                 phone: '02134320437',
//                 settings: {
//                     create: {},
//                 },
//             },
//         });
//         await prisma.userRole.create({
//             data: {
//                 userId: 2,
//                 roleId: userRoleId,
//             },
//         });
//     }
// }

// async function HashPassword(plainText: string): Promise<any> {
//     return new Promise(function (resolve, reject) {
//         genSalt(10, function (error, salt) {
//             if (error) {
//                 reject(error);
//             } else {
//                 hash(plainText, salt, null, function (error, hash) {
//                     if (error) {
//                         reject(error);
//                     } else {
//                         resolve(hash);
//                     }
//                 });
//             }
//         });
//     });
// }

// export async function createRolesAndPermissions(prisma: PrismaClient) {
//     const getRoles = await prisma.role.findFirst({ where: { name: 'Admin' } });
//     if (!getRoles) {
//         const allPermissions = await getPermissions(prisma).then((data) => data);
//         const adminPermission = allPermissions.filter((obj: any) => {
//             return obj.action === 'ACCESS_ALL';
//         })[0].id;
//         const adminRole = await prisma.role.create({
//             data: {
//                 name: 'Admin',
//                 permissions: {
//                     create: {
//                         permissionId: adminPermission,
//                     },
//                 },
//             },
//         });
//         const userPermissions = allPermissions.map((obj: any) => {
//             if (!inArray(obj.action, ['ACCESS_ALL', 'ALL'])) {
//                 return {
//                     permissionId: obj.id,
//                 };
//             }
//         });
//         const userRole = await prisma.role.create({
//             data: {
//                 name: 'User',
//                 permissions: {
//                     create: userPermissions,
//                 },
//             },
//         });

//         await createAdmin(prisma, adminRole.id);
//         await createUser(prisma, userRole.id);
//     }
// }
