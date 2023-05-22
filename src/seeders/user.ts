import { PrismaClient, UserType } from '@prisma/client';
import * as argon from 'argon2';
import { riders, vendors } from './constants';
import { companySchedule } from 'src/core/constants';

export async function createAdmin(prisma: PrismaClient) {
  await prisma.userMaster.upsert({
    where: {
      userMasterId: 1,
    },
    update: {
      email: 'admin@clevis.com',
      password: await argon.hash('click123'),
      userType: UserType.ADMIN,
      phone: '123456789',
      isEmailVerified: true,
      roleId: 1,
      admin: {
        upsert: {
          update: {
            email: 'admin@clevis.com',
            fullName: 'Admin',
          },
          create: {
            email: 'admin@clevis.com',
            fullName: 'Admin',
          },
        },
      },
    },
    create: {
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

export async function createVendors(prisma: PrismaClient) {
  const userCount = await prisma.userMaster.count({
    where: { userType: UserType.VENDOR },
  });

  if (userCount < 1) {
    vendors.forEach(async (vendor) => {
      const roleId = await getRoleByType(UserType.VENDOR, prisma);
      const businesess = [];
      const workspaces = [];
      vendor.businessLicense.forEach(async (business) => {
        const result = await prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        businesess.push(result);
      });

      vendor.workspaceImages.forEach(async (business) => {
        const result = await prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        workspaces.push(result);
      });
      const user = await prisma.userMaster.create({
        data: {
          email: vendor.email,
          password: await argon.hash('click123'),
          phone: vendor.phone,
          userType: UserType.VENDOR,
          roleId: roleId,
          isEmailVerified: true,
          // profilePicture: {
          //   create: {
          //     location: vendor.logo.location,
          //     key: vendor.logo.key,
          //     name: vendor.logo.name,
          //   },
          // },
          vendor: {
            create: {
              fullName: vendor.fullName,
              companyEmail: vendor.companyEmail,
              companyName: vendor.companyName,
              status: 'APPROVED',
              logo: {
                create: {
                  location: vendor.logo.location,
                  key: vendor.logo.key,
                  name: vendor.logo.name,
                },
              },
              description: vendor.description,
              serviceType: vendor.serviceType,
              userAddress: {
                create: {
                  fullAddress: vendor.fullAddress,
                  cityId: vendor.cityId,
                  latitude: vendor.latitude,
                  longitude: vendor.longitude,
                },
              },
              companySchedule: {
                createMany: {
                  data: companySchedule(),
                },
              },
            },
          },
        },
        select: {
          userMasterId: true,
          // profileImage: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          vendor: {
            select: {
              userAddress: {
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  cityId: true,
                  longitude: true,
                  latitude: true,
                },
              },
              fullName: true,
              vendorId: true,
              companyEmail: true,
              companyName: true,
              logo: true,
              // workspaceImages: true,
              // businessLicense: true,
              description: true,
              serviceType: true,
            },
          },
        },
      });
      await prisma.businessLicense.createMany({
        data: businesess.map((item) => ({
          vendorVendorId: user.vendor.vendorId,
          mediaId: item.id,
        })),
      });

      await prisma.workspaceImages.createMany({
        data: workspaces.map((item) => ({
          vendorVendorId: user.vendor.vendorId,
          mediaId: item.id,
        })),
      });
    });
  }
}

export async function createRiders(prisma: PrismaClient) {
  const userCount = await prisma.userMaster.count({
    where: { userType: UserType.RIDER },
  });

  if (userCount < 1) {
    riders.forEach(async (rider) => {
      const roleId = await getRoleByType(UserType.RIDER, prisma);
      const businesess = [];
      const workspaces = [];

      rider.businessLicense.forEach(async (business) => {
        const result = await prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        businesess.push(result);
      });

      rider.workspaceImages.forEach(async (business) => {
        const result = await prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        workspaces.push(result);
      });
      const user = await prisma.userMaster.create({
        data: {
          email: rider.email,
          password: await argon.hash('click123'),
          phone: rider.phone,
          userType: UserType.RIDER,
          roleId: roleId,
          rider: {
            create: {
              fullName: rider.fullName,
              companyEmail: rider.companyEmail,
              companyName: rider.companyName,
              logo: {
                create: {
                  location: rider.logo.location,
                  key: rider.logo.key,
                  name: rider.logo.name,
                },
              },
              // workspaceImages: rider.workspaceImages,
              // businessLicense: rider.businessLicense,
              description: rider.description,
              userAddress: {
                create: {
                  fullAddress: rider.fullAddress,
                  cityId: rider.cityId,
                  latitude: rider.latitude,
                  longitude: rider.longitude,
                },
              },
              companySchedule: {
                createMany: {
                  data: companySchedule(),
                },
              },
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          rider: {
            select: {
              userAddress: {
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  cityId: true,
                  longitude: true,
                  latitude: true,
                },
              },
              fullName: true,
              riderId: true,
              logo: {
                select: {
                  id: true,
                  location: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      await prisma.businessLicense.createMany({
        data: businesess.map((item) => ({
          riderRiderId: user.rider.riderId,
          mediaId: item.id,
        })),
      });

      await prisma.workspaceImages.createMany({
        data: workspaces.map((item) => ({
          riderRiderId: user.rider.riderId,
          mediaId: item.id,
        })),
      });
    });
  }
}

async function getRoleByType(userType: UserType, prisma: PrismaClient) {
  const userId = await prisma.role.findFirst({
    where: {
      userType: userType,
      isDeleted: false,
      isActive: true,
    },
    select: {
      id: true,
      isActive: true,
      name: true,
    },
  });

  return userId.id;
}
