import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpdateRequestDto,
  CreateAndUpdateDeliverySchedule,
  UpdateVendorDto,
  UpdateVendorScheduleDto,
  VendorCreateServiceDto,
  VendorUpdateBusyStatusDto,
  VendorUpdateServiceDto,
  VendorUpdateStatusDto,
  GetRiderListing,
} from './dto';
import {
  EntityType,
  Media,
  NotificationType,
  ServiceType,
  Status,
  UserType,
  Vendor,
} from '@prisma/client';
import {
  GetUserType,
  VendorListingParams,
  VendorServiceListingParams,
} from 'src/core/dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import {
  getRiderDirectoryMapper,
  vendorServiceByIdMappedCarWash,
  vendorServiceByIdMappedLaundry,
} from './vendor.mapper';
import { ERROR_MESSAGE } from 'src/core/constants';
import { NotificationData } from 'src/modules/notification-socket/types';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationBody, NotificationTitle } from 'src/constants';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { currentDateToVendorFilter } from 'src/helpers/date.helper';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';

@Injectable()
export class VendorRepository {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createVendorService(dto: VendorCreateServiceDto, userMasterId: number) {
    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: {
          userMasterId,
        },
      });

      await this.createCarWashVendorService(dto, vendor);

      return true;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('VendorService is already created');
      }
      throw error;
    }
  }

  async createDeliverySchedule(
    dto: CreateAndUpdateDeliverySchedule,
    vendorId: number,
  ) {
    try {
      await this.prisma.deliverySchedule.create({
        data: {
          vendorId,
          ...(dto.deliveryDurationMax && {
            deliveryDurationMax: dto.deliveryDurationMax,
          }),
          ...(dto.deliveryDurationMin && {
            deliveryDurationMin: dto.deliveryDurationMin,
          }),
          ...(dto.serviceDurationMax && {
            serviceDurationMax: dto.serviceDurationMax,
          }),
          ...(dto.serviceDurationMin && {
            serviceDurationMin: dto.serviceDurationMin,
          }),
          ...(dto.deliveryItemMax && { deliveryItemMax: dto.deliveryItemMax }),
          ...(dto.deliveryItemMin && { deliveryItemMin: dto.deliveryItemMin }),
          ...(dto.kilometerFare && { kilometerFare: dto.kilometerFare }),
        },
      });
      return successResponse(200, 'successfully Created');
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Delivery Schedule is already created');
      }
      throw error;
    }
  }

  async updateVendorService(
    dto: VendorUpdateServiceDto,
    userMasterId: number,
    vendorServiceId: number,
  ) {
    try {
      await this.updateCarWashVendorService(dto, vendorServiceId);

      return true;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('VendorService is already created');
      } else if (error.code === 'P2025') {
        throw new BadRequestException('VendorService does not exist');
      }
      throw error;
    }
  }

  async approveVendor(id: number, dto: VendorUpdateStatusDto) {
    try {
      const vendor = await this.prisma.vendor.update({
        where: {
          vendorId: id,
        },
        data: {
          status: dto.status,
        },
      });

      return vendor;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException(
          'The vendor with this vendorId does not exist',
        );
      } else {
        throw error;
      }
    }
  }

  async updateVendorSchedule(vendorId: number, dto: UpdateVendorScheduleDto) {
    try {
      dto.companySchedule.forEach(async (element) => {
        await this.prisma.companySchedule.update({
          where: {
            id: element.id,
          },
          data: {
            startTime: element.startTime,
            endTime: element.endTime,
            isActive: element.isActive,
          },
        });
      });

      if (typeof dto.alwaysOpen === 'boolean') {
        await this.prisma.vendor.update({
          where: {
            vendorId: vendorId,
          },
          data: {
            alwaysOpen: dto.alwaysOpen,
          },
        });
      }

      const scheduleArray = await this.prisma.companySchedule.findMany({
        where: {
          vendorId: vendorId,
        },
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          isActive: true,
        },
      });
      return {
        ...successResponse(200, 'Schedule updated successfully!'),
        data: scheduleArray,
        alwaysOpen: dto.alwaysOpen,
      };
    } catch (error) {
      throw error;
    }
  }

  async requestUpdate(dto: UpdateRequestDto, vendorId: number) {
    try {
      const businesess = [];

      if (dto.businessLicense) {
        dto.businessLicense.forEach(async (business) => {
          const result = await this.prisma.media.create({
            data: business,
            select: {
              id: true,
            },
          });
          businesess.push(result.id.toString());
        });
      }

      const businessLicenseIds = businesess.join(',');

      await this.prisma.updateApproval.create({
        data: {
          companyEmail:
            dto.companyEmail !== null ? dto.companyEmail : undefined,
          companyName: dto.companyName !== null ? dto.companyName : undefined,
          vendorId,
          ...(businessLicenseIds && {
            businessLicenseIds: businessLicenseIds,
          }),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Update request is already created');
      }
      throw error;
    }
  }

  async updateBusyStatusVendor(
    vendorId: number,
    dto: VendorUpdateBusyStatusDto,
  ) {
    try {
      await this.prisma.vendor.update({
        where: {
          vendorId,
        },
        data: {
          isBusy: dto.isBusy,
        },
      });

      return successResponse(200, 'Status updated successfully.');
    } catch (error) {
      throw error;
    }
  }

  async updateVendor(
    userMasterId: number,
    dto: UpdateVendorDto,
    userType: UserType,
  ) {
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId,
        },
        select: {
          vendor: {
            select: {
              vendorId: true,
            },
          },
        },
      });

      if (!user) throw new ForbiddenException('User does not exist');

      let profilePicture: Media;
      let logo: Media;

      if (dto.profilePicture) {
        profilePicture = await this.prisma.media.create({
          data: {
            name: dto.profilePicture.name,
            key: dto.profilePicture.key,
            location: dto.profilePicture.location,
          },
        });
      }

      if (dto.logo) {
        logo = await this.prisma.media.create({
          data: {
            name: dto.logo.name,
            key: dto.logo.key,
            location: dto.logo.location,
          },
        });
      }

      // const businesess = [];
      const workspaces = [];
      // if (dto.businessLicense) {
      //   dto.businessLicense.forEach(async (business) => {
      //     const result = await this.prisma.media.create({
      //       data: business,
      //       select: {
      //         id: true,
      //       },
      //     });
      //     businesess.push(result);
      //   });
      // }

      if (dto.workspaceImages) {
        dto.workspaceImages.forEach(async (workspace) => {
          const result = await this.prisma.media.create({
            data: workspace,
            select: {
              id: true,
            },
          });
          workspaces.push(result);
        });
      }

      if (dto.userAddressId) {
        await this.prisma.userAddress.update({
          where: {
            userAddressId: dto.userAddressId,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      if (dto.accountNumber && dto.accountTitle && dto.bankName) {
        await this.prisma.banking.updateMany({
          where: {
            vendorId: user.vendor.vendorId,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      if (
        (dto.fullAddress ||
          dto.cityId ||
          typeof dto.longitude === 'number' ||
          typeof dto.latitude === 'number') &&
        !(
          dto.fullAddress &&
          dto.cityId &&
          typeof dto.longitude === 'number' &&
          typeof dto.latitude === 'number'
        )
      ) {
        throw new BadRequestException(
          "Please provide every parameter in the address (fullAddress, cityId, lat, long) to update the user's address",
        );
      }

      if (dto.userAddressId) {
        await this.prisma.userAddress.update({
          where: {
            userAddressId: dto.userAddressId,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      const vendor = await this.prisma.userMaster.update({
        where: {
          userMasterId: userMasterId,
        },
        data: {
          phone: dto.phone !== null ? dto.phone : undefined,
          profilePictureId: profilePicture ? profilePicture.id : undefined,
          isActive: dto.isActive !== null ? dto.isActive : undefined,
          vendor: {
            update: {
              fullName: dto.fullName !== null ? dto.fullName : undefined,
              description:
                dto.description !== null ? dto.description : undefined,
              // companyEmail:
              //   dto.companyEmail !== null ? dto.companyEmail : undefined,
              logoId: logo ? logo.id : undefined,

              ...(dto.fullAddress &&
                dto.cityId &&
                dto.longitude &&
                dto.latitude && {
                  userAddress: {
                    create: {
                      fullAddress: dto.fullAddress,
                      cityId: dto.cityId,
                      latitude: dto.latitude,
                      longitude: dto.longitude,
                    },
                  },
                }),

              ...(dto.accountNumber &&
                dto.accountTitle &&
                dto.bankName && {
                  banking: {
                    create: {
                      accountTitle:
                        dto.accountTitle !== null
                          ? dto.accountTitle
                          : undefined,
                      accountNumber:
                        dto.accountNumber !== null
                          ? dto.accountNumber
                          : undefined,
                      bankName:
                        dto.bankName !== null ? dto.bankName : undefined,
                    },
                  },
                }),
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          isActive: true,

          profilePicture: {
            select: {
              key: true,
              location: true,
              name: true,
              id: true,
            },
          },
          vendor: {
            select: {
              userMasterId: true,
              vendorId: true,
              vendorService: {
                select: {
                  vendorServiceId: true,
                  service: {
                    select: {
                      serviceName: true,
                    },
                  },
                },
              },
              businessLicense: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              banking: {
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                  isDeleted: true,
                },
              },
              fullName: true,
              companyName: true,
              serviceType: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
            },
          },
          earnings: {
            select: {
              id: true,
            },
          },
        },
      });

      // if (businesess.length > 0) {
      //   await this.prisma.businessLicense.createMany({
      //     data: businesess.map((item) => ({
      //       vendorVendorId: vendor.vendor.vendorId,
      //       mediaId: item.id,
      //     })),
      //   });
      // }

      if (workspaces.length > 0) {
        await this.prisma.workspaceImages.createMany({
          data: workspaces.map((item) => ({
            vendorVendorId: vendor.vendor.vendorId,
            mediaId: item.id,
          })),
        });
      }

      if (userType === UserType.ADMIN) {
        const payload: SQSSendNotificationArgs<NotificationData> = {
          type: NotificationType.UpdateByAdmin,
          userId: [vendor.userMasterId],
          data: {
            title: NotificationTitle.VENDOR_UPDATE_BY_ADMIN,
            body: NotificationBody.VENDOR_UPDATE_BY_ADMIN,
            type: NotificationType.UpdateByAdmin,
            entityType: EntityType.VENDOR,
            entityId: vendor.userMasterId,
          },
        };
        await this.notificationService.HandleNotifications(
          payload,
          UserType.VENDOR,
        );
      }

      return {
        ...successResponse(200, 'Vendor updated successfully.'),
        ...vendor,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllVendorService(
    vendorId: number,
    listingParams: VendorServiceListingParams,
  ) {
    const { page = 1, take = 10, search, order = 'asc' } = listingParams;
    try {
      const vendorServices = await this.prisma.vendorService.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          service: {
            serviceName: order,
          },
        },
        where: {
          vendorId: vendorId,
          isDeleted: false,
          ...(search && {
            service: {
              serviceName: {
                contains: search !== null ? search : undefined,
                mode: 'insensitive',
              },
            },
          }),
        },
        select: {
          vendorServiceId: true,
          description: true,
          status: true,
          vendorId: true,
          serviceImage: {
            select: {
              id: true,
              media: {
                select: {
                  id: true,
                  location: true,
                  key: true,
                  name: true,
                },
              },
            },
          },
          service: {
            select: {
              serviceName: true,
            },
          },
        },
      });

      const totalCount = await this.prisma.vendorService.count({
        where: {
          vendorId: vendorId,
          isDeleted: false,
          ...(search && {
            service: {
              serviceName: {
                contains: search !== null ? search : undefined,
                mode: 'insensitive',
              },
            },
          }),
        },
      });

      return { data: vendorServices, page, take, totalCount };
    } catch (error) {
      throw error;
    }
  }

  // async getDashboard(user: GetUserType) {
  //   try {
  //     const result = await this.prisma.vendorService.findMany({
  //       where: {
  //         vendorId: user.userTypeId,
  //       },
  //       select: {
  //         vendorServiceId: true,
  //       },
  //     });
  //     const vendorServiceIds = result.map((item) => item.vendorServiceId);

  //     const allocatePrices = await this.prisma.allocatePrice.findMany({
  //       where: {
  //         vendorServiceId: {
  //           in: vendorServiceIds,
  //         },
  //       },
  //       select: {
  //         bookingDetail: {
  //           select: {
  //             allocatePriceId: true,
  //           },
  //         },
  //       },
  //     });
  //     const allocatePriceIds = allocatePrices.map((item) =>
  //       item.bookingDetail.map((obj) => obj.allocatePriceId),
  //     );

  //     let array = [];
  //     allocatePriceIds.forEach((arr) => (array = [...array, ...arr]));
  //     const data = await this.prisma.bookingMaster.findMany({
  //       where: {
  //         isDeleted: false,
  //         vendorId: user.userTypeId,
  //         bookingDetail: {
  //           some: {
  //             allocatePriceId: {
  //               in: array,
  //             },
  //           },
  //         },
  //       },
  //       select: {
  //         bookingDetail: {
  //           select: {
  //             allocatePrice: {
  //               select: {
  //                 vendorService: {
  //                   select: {
  //                     service: {
  //                       select: { serviceId: true, serviceName: true },
  //                     },
  //                   },
  //                 },
  //                 category: {
  //                   select: { categoryId: true, categoryName: true },
  //                 },
  //                 price: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     const services = {};

  //     data.forEach((booking) => {
  //       booking.bookingDetail.forEach((detail) => {
  //         const { serviceName } = detail.allocatePrice.vendorService.service;
  //         const price = detail.allocatePrice.price;
  //         if (services[serviceName]) {
  //           services[serviceName] += price;
  //         } else {
  //           services[serviceName] = price;
  //         }
  //       });
  //     });

  //     return { services, data };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getVendorServices(vendorId: number) {
    try {
      const vendorServices = await this.prisma.vendorService.findMany({
        orderBy: {
          service: {
            serviceName: 'asc',
          },
        },
        where: {
          vendorId: vendorId,
          isDeleted: false,
        },
        select: {
          vendorServiceId: true,
          service: {
            select: {
              serviceName: true,
            },
          },
        },
      });

      return vendorServices;
    } catch (error) {
      throw error;
    }
  }

  async getVendorServiceById(vendorServiceId: number) {
    try {
      const vendorService = await this.prisma.vendorService.findUnique({
        where: {
          vendorServiceId: vendorServiceId,
        },
        select: {
          service: {
            select: {
              serviceName: true,
              serviceId: true,
              serviceType: true,
            },
          },
          description: true,
          status: true,
          AllocatePrice: {
            where: {
              vendorServiceId,
              isDeleted: false,
            },
            select: {
              id: true,
              category: {
                select: {
                  categoryId: true,
                  categoryName: true,
                },
              },
              subcategory: {
                select: {
                  subCategoryName: true,
                  subCategoryId: true,
                },
              },
              price: true,
            },
          },
          serviceImage: {
            where: {
              media: {
                isDeleted: false,
              },
            },
            select: {
              id: true,
              media: {
                select: {
                  id: true,
                  key: true,
                  location: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!vendorService) {
        throw unknowError(417, {}, 'VendorserviceId does not exist');
      }

      let vendorServiceSubcategories: any;
      if (vendorService?.service?.serviceType === ServiceType.LAUNDRY) {
        vendorServiceSubcategories = await this.prisma.allocatePrice.findMany({
          where: {
            vendorServiceId,
          },
          distinct: ['subcategoryId'],
          select: {
            subcategory: {
              select: {
                subCategoryId: true,
                subCategoryName: true,
              },
            },
          },
        });
      }

      const mappedVendorService =
        vendorService.service.serviceType === ServiceType.LAUNDRY
          ? vendorServiceByIdMappedLaundry(vendorService)
          : vendorService.service.serviceType === ServiceType.CAR_WASH
          ? vendorServiceByIdMappedCarWash(vendorService)
          : vendorService.AllocatePrice;

      return {
        ...vendorService,
        AllocatePrice: mappedVendorService,
        ...(vendorServiceSubcategories && {
          vendorServiceSubcategories,
        }),
      };
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
    }
  }

  async getVendorByIdProfile(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          profilePicture: {
            select: {
              key: true,
              location: true,
              name: true,
              id: true,
            },
          },
          vendor: {
            select: {
              vendorId: true,
              fullName: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorByIdCompany(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          isEmailVerified: true,
          phone: true,
          vendor: {
            select: {
              vendorId: true,
              fullName: true,
              description: true,
              companyEmail: true,
              companyName: true,
              businessLicense: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              userAddress: {
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorByIdAccount(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          vendor: {
            select: {
              vendorId: true,
              banking: {
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                  isDeleted: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorByIdSchedule(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          vendor: {
            select: {
              vendorId: true,
              alwaysOpen: true,
              companySchedule: {
                orderBy: {
                  id: 'asc',
                },
                select: {
                  id: true,
                  day: true,
                  startTime: true,
                  endTime: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(id: number) {
    try {
      const vendorGet = await this.prisma.userMaster.findFirst({
        where: {
          userMasterId: id,
          userType: UserType.VENDOR,
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          isActive: true,
          vendor: {
            select: {
              vendorId: true,
              vendorService: {
                select: {
                  vendorServiceId: true,
                  service: {
                    select: {
                      serviceName: true,
                    },
                  },
                },
              },
              businessLicense: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              banking: {
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                },
              },
              fullName: true,
              companyName: true,
              serviceType: true,
              userAddress: {
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
            },
          },
          earnings: {
            select: {
              id: true,
            },
          },
        },
      });
      if (vendorGet == null) {
        throw unknowError(417, { status: 404 }, 'Vendor does not exist');
      } else {
        return vendorGet;
      }
    } catch (error) {
      throw unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors ',
      );
    }
  }

  async getRiderDirectory(user: GetUserType, listingParams: GetRiderListing) {
    const { page = 1, take = 10, search, orderBy } = listingParams;
    try {
      if (user.serviceType === ServiceType.CAR_WASH) {
        throw new ForbiddenException(
          'Car Wash vendors are not allowed to view the rider directory',
        );
      }

      const dayObj = currentDateToVendorFilter(dayjs().utc().format());

      const currentCity = await this.prisma.userAddress.findFirst({
        where: {
          vendorId: user.userTypeId,
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          cityId: true,
        },
      });

      const riders = await this.prisma.userMaster.findMany({
        where: {
          isDeleted: false,
          isActive: true,
          userType: UserType.RIDER,
          isEmailVerified: true,
          rider: {
            status: Status.APPROVED,
            isBusy: false,
            userAddress: {
              some: {
                cityId: currentCity.cityId,
                isDeleted: false,
              },
            },
            ...(search && {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            }),
          },
        },
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          rider: {
            companyName: orderBy ? orderBy : 'asc',
          },
        },
        select: {
          userMasterId: true,
          phone: true,
          rider: {
            select: {
              companyName: true,
              companyEmail: true,
              logo: {
                select: {
                  name: true,
                  location: true,
                  key: true,
                },
              },
              companySchedule: {
                select: {
                  day: true,
                  startTime: true,
                  endTime: true,
                  isActive: true,
                },
              },
              userAddress: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  fullAddress: true,
                },
                take: 1,
              },
            },
          },
        },
      });

      const totalCount = await this.prisma.userMaster.count({
        where: {
          isDeleted: false,
          isActive: true,
          userType: UserType.RIDER,
          isEmailVerified: true,
          rider: {
            status: Status.APPROVED,
            userAddress: {
              some: {
                cityId: currentCity.cityId,
                isDeleted: false,
              },
            },
            ...(search && {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            }),
          },
        },
      });

      const mappedRiders = getRiderDirectoryMapper(riders, dayObj);

      return {
        data: mappedRiders,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllVendors(listingParams: VendorListingParams) {
    const { page = 1, take = 10, search, status, serviceType } = listingParams;
    try {
      const vendors = await this.prisma.userMaster.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          isDeleted: false,
          isEmailVerified: true,
          userType: UserType.VENDOR,
          vendor: {
            ...(search && {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
              ],
            }),
            status: {
              equals: status !== null ? status : undefined,
            },
            serviceType: {
              equals: serviceType !== null ? serviceType : undefined,
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          isActive: true,
          vendor: {
            select: {
              vendorId: true,
              businessLicense: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              fullName: true,
              companyName: true,
              serviceType: true,
              userAddress: {
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
            },
          },
        },
      });

      const totalCount = await this.prisma.userMaster.count({
        where: {
          isEmailVerified: true,
          isDeleted: false,
          userType: UserType.VENDOR,
          vendor: {
            status:
              listingParams.status !== null ? listingParams.status : undefined,
          },
        },
      });

      return {
        data: vendors,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
  }

  async deleteVendorService(id: number) {
    try {
      await this.prisma.vendorService.update({
        where: {
          vendorServiceId: id,
        },
        data: {
          isDeleted: true,
        },
      });
      return successResponse(200, 'Vendor Service deleted successfully.');
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException(
          'The vendor with this vendorId does not exist',
        );
      }
      throw error;
    }
  }

  async createCarWashVendorService(
    dto: VendorCreateServiceDto,
    vendor: Vendor,
  ) {
    try {
      const serviceCount = await this.prisma.vendorService.count({
        where: {
          serviceId: dto.serviceId,
          vendorId: vendor.vendorId,
          service: { serviceType: vendor.serviceType },
          isDeleted: false,
        },
      });

      if (serviceCount > 0) {
        throw new ConflictException(
          'Service is already created, please update the current vendor service instead of creating duplicates',
        );
      }

      const serviceImages = [];
      dto.serviceImages.forEach(async (serviceImage) => {
        const result = await this.prisma.media.create({
          data: serviceImage,
          select: {
            id: true,
          },
        });
        serviceImages.push(result);
      });
      const vendorService = await this.prisma.vendorService.create({
        data: {
          vendorId: vendor.vendorId,
          serviceId: dto.serviceId,
          AllocatePrice: {
            createMany: {
              data: dto.allocatePrice,
            },
          },

          description: dto.description,
        },
        select: {
          vendorServiceId: true,
        },
      });

      await this.prisma.serviceImage.createMany({
        data: serviceImages.map((item) => ({
          vendorServiceId: vendorService.vendorServiceId,
          mediaId: item.id,
        })),
      });

      return successResponse(201, 'Vendor service successfully created');
    } catch (error) {
      throw error;
    }
  }

  async updateCarWashVendorService(
    dto: VendorUpdateServiceDto,
    vendorServiceId: number,
  ) {
    try {
      const serviceImages = [];

      if (dto.serviceImages) {
        dto.serviceImages.forEach(async (serviceImage) => {
          const result = await this.prisma.media.create({
            data: serviceImage,
            select: {
              id: true,
            },
          });
          serviceImages.push(result);
        });
      }

      const vendorService = await this.prisma.vendorService.update({
        where: {
          vendorServiceId: vendorServiceId,
        },
        data: {
          serviceId: dto.serviceId !== null ? dto.serviceId : undefined,
          description: dto.description !== null ? dto.description : undefined,
          status: dto.status !== null ? dto.status : undefined,
        },
        select: {
          vendorServiceId: true,
        },
      });

      if (dto.allocatePrice) {
        const unRemovedAllocatePrice = dto.allocatePrice.filter(
          (item) => item.allocatePriceId,
        );

        const unRemovedAllocatePriceIds = unRemovedAllocatePrice.map(
          (item) => item.allocatePriceId,
        );

        await this.prisma.allocatePrice.updateMany({
          where: {
            vendorServiceId: vendorService.vendorServiceId,
            id: {
              notIn: unRemovedAllocatePriceIds,
            },
          },
          data: {
            isDeleted: true,
          },
        });

        dto.allocatePrice.forEach(async (allocate) => {
          await this.prisma.allocatePrice.upsert({
            where: {
              id: allocate?.allocatePriceId || 0,
            },
            update: {
              categoryId: allocate.categoryId,
              price: allocate.price,
              ...(allocate.subcategoryId && {
                subcategoryId: allocate.subcategoryId,
              }),
            },
            create: {
              categoryId: allocate.categoryId,
              price: allocate.price,
              subcategoryId: allocate.subcategoryId,
              vendorServiceId,
            },
          });
        });
      }

      if (dto.serviceImages) {
        await this.prisma.serviceImage.createMany({
          data: serviceImages.map((item) => ({
            vendorServiceId: vendorService.vendorServiceId,
            mediaId: item.id,
          })),
        });
      }

      return successResponse(200, 'Vendor service successfully updated');
    } catch (error) {
      throw error;
    }
  }

  async deleteVendor(id: number) {
    try {
      await this.prisma.userMaster.update({
        where: {
          userMasterId: id,
        },
        data: {
          isDeleted: true,
        },
      });
      return successResponse(202, 'successfully deleted');
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors ',
      );
    }
  }

  async deliveryScheduleUpdate(
    vendorId: number,
    dto: CreateAndUpdateDeliverySchedule,
  ) {
    try {
      const result = await this.prisma.deliverySchedule.findUnique({
        where: {
          vendorId: vendorId,
        },
      });
      if (!result) {
        throw unknowError(417, {}, 'not found');
      } else if (
        !(
          dto.deliveryDurationMax ||
          dto.deliveryDurationMin ||
          dto.deliveryItemMax ||
          dto.deliveryItemMin ||
          dto.serviceDurationMax ||
          dto.serviceDurationMin ||
          dto.kilometerFare
        )
      ) {
        throw new BadRequestException('Invalid payload');
      }
      const deliverySchedule = await this.prisma.deliverySchedule.update({
        where: { vendorId },
        data: {
          ...(dto.deliveryDurationMax && {
            deliveryDurationMax: dto.deliveryDurationMax,
          }),
          ...(dto.deliveryDurationMin && {
            deliveryDurationMin: dto.deliveryDurationMin,
          }),
          ...(dto.serviceDurationMax && {
            serviceDurationMax: dto.serviceDurationMax,
          }),
          ...(dto.serviceDurationMin && {
            serviceDurationMin: dto.serviceDurationMin,
          }),
          ...(dto.deliveryItemMax && { deliveryItemMax: dto.deliveryItemMax }),
          ...(dto.deliveryItemMin && { deliveryItemMin: dto.deliveryItemMin }),
          ...(dto.kilometerFare && { kilometerFare: dto.kilometerFare }),
        },
        select: {
          deliveryDurationMax: true,
          deliveryDurationMin: true,
          serviceDurationMax: true,
          serviceDurationMin: true,
          deliveryItemMax: true,
          deliveryItemMin: true,
          kilometerFare: true,
        },
      });

      return {
        ...successResponse(200, 'DeliverySchedule updated successfully.'),
        ...deliverySchedule,
      };
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
    }
  }

  async getDeliverySchedule(vendorId: number) {
    try {
      // const delivery = await this.prisma.deliverySchedule.findUnique({
      //   where: { vendorId: vendorId },
      //   select: {
      //     deliveryDurationMax: true,
      //     deliveryDurationMin: true,
      //     serviceDurationMax: true,
      //     serviceDurationMin: true,
      //     deliveryItemMax: true,
      //     deliveryItemMin: true,
      //     kilometerFare: true,
      //   },
      // });

      const delivery = await this.prisma.deliverySchedule.findUnique({
        where: {
          vendorId,
        },
        select: {
          deliveryDurationMax: true,
          deliveryDurationMin: true,
          serviceDurationMax: true,
          serviceDurationMin: true,
          deliveryItemMax: true,
          deliveryItemMin: true,
          kilometerFare: true,
        },
      });
      return delivery;
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
    }
  }
  //   async createLaundryVendorService(
  //     dto: VendorCreateServiceDto,
  //     vendor: Vendor,
  //   ) {
  //     return await this.prisma.vendorService.create({
  //       data: {},
  //     });
  //   }
}
