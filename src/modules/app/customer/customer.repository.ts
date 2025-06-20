import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CustomerListingParams } from '../../../core/dto';
import {
  EntityType,
  Media,
  NotificationType,
  Status,
  UserType,
  VendorServiceStatus,
} from '@prisma/client';
import {
  UpdateCustomerDto,
  VendorLocationDto,
  VendorServiceParams,
  VendorStatus,
} from './dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { currentDateToVendorFilter } from 'src/helpers/date.helper';
import { getVendorListingMapper } from './customer.mapper';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/modules/mail/mail.service';
import { NotificationBody, NotificationTitle } from 'src/constants';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationData } from 'src/modules/notification-socket/types';

@Injectable()
export class CustomerRepository {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private config: ConfigService,
    private notificationService: NotificationService,
  ) {}

  async getCustomerById(id: number, isCustomer = false) {
    try {
      const customer = await this.prisma.userMaster.findFirst({
        where: {
          userMasterId: id,
          userType: UserType.CUSTOMER,
          isDeleted: false,
        },
        select: {
          email: true,
          userMasterId: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          userType: true,
          notificationEnabled: true,
          profilePicture: {
            select: {
              id: true,
              name: true,
              key: true,
              location: true,
            },
          },
          customer: {
            select: {
              fullName: true,
              customerId: true,
              userAddress: {
                where: {
                  isDeleted: false,
                  ...(isCustomer && {
                    cityId: {
                      not: null,
                    },
                  }),
                },
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  isActive: true,
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateId: true,
                          stateName: true,
                          country: {
                            select: {
                              countryId: true,
                              countryName: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!customer) throw new BadRequestException('User does not exist');

      const activeAddress = await this.prisma.userAddress.findFirst({
        where: {
          customerId: customer.customer.customerId,
          isActive: true,
          fullAddress: {
            not: null,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return { ...customer, activeAddress };
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers(listingParams: CustomerListingParams) {
    const { page = 1, take = 10, search, orderBy } = listingParams;
    try {
      const customers = await this.prisma.userMaster.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: orderBy || 'desc',
        },

        where: {
          isDeleted: false,
          userType: UserType.CUSTOMER,
          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                customer: {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }),
        },
        select: {
          userMasterId: true,
          phone: true,
          email: true,
          userType: true,
          isActive: true,
          customer: {
            select: {
              customerId: true,
              fullName: true,
              userAddress: {
                where: {
                  isDeleted: false,
                  isActive: true,
                },
                select: {
                  userAddressId: true,
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalCount = await this.prisma.userMaster.count({
        where: {
          isDeleted: false,
          userType: UserType.CUSTOMER,
          ...(search && {
            customer: {
              fullName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          }),
        },
      });

      return {
        customers,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(userMasterId: number, dto: UpdateCustomerDto) {
    try {
      let media: Media;
      if (dto.profilePicture && dto.profilePicture.hasOwnProperty('location')) {
        media = await this.prisma.media.create({
          data: {
            name: dto.profilePicture.name,
            key: dto.profilePicture.key,
            location: dto.profilePicture.location,
          },
        });
      }

      if (
        (dto.cityId || dto.userAddressId) &&
        !(dto.cityId && dto.userAddressId)
      ) {
        throw new BadRequestException(
          "Please provide every parameter in the address (userAddressId, cityId) to update the user's city",
        );
      }

      const customer = await this.prisma.userMaster.update({
        where: {
          userMasterId: userMasterId,
        },
        data: {
          phone: dto.phone !== null ? dto.phone : undefined,
          profilePictureId: media ? media.id : undefined,
          isActive: dto.isActive !== null ? dto.isActive : undefined,
          customer: {
            update: {
              fullName: dto.fullName !== null ? dto.fullName : undefined,
              ...(dto.userAddressId &&
                dto.cityId && {
                  userAddress: {
                    update: {
                      where: {
                        userAddressId: dto.userAddressId,
                      },
                      data: {
                        cityId: dto.cityId,
                        fullAddress: dto.fullAddress
                          ? dto.fullAddress
                          : undefined,
                      },
                    },
                  },
                }),
            },
          },
        },
        select: {
          email: true,
          userMasterId: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          userType: true,
          notificationEnabled: true,
          profilePicture: {
            select: {
              id: true,
              name: true,
              key: true,
              location: true,
            },
          },
          customer: {
            select: {
              userMaster: {
                select: {
                  email: true,
                },
              },
              fullName: true,
              customerId: true,
              userAddress: {
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateId: true,
                          stateName: true,
                          country: {
                            select: {
                              countryId: true,
                              countryName: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      const activeAddress = await this.prisma.userAddress.findFirst({
        where: {
          customerId: customer.customer.customerId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (customer.userType === UserType.ADMIN) {
        const payload: SQSSendNotificationArgs<NotificationData> = {
          type: NotificationType.UpdateByAdmin,
          userId: [customer.userMasterId],
          data: {
            title: NotificationTitle.VENDOR_UPDATE_BY_ADMIN,
            body: NotificationBody.VENDOR_UPDATE_BY_ADMIN,
            type: NotificationType.UpdateByAdmin,
            entityType: EntityType.CUSTOMER,
            entityId: customer.customer.customerId,
          },
        };
        await this.notificationService.HandleNotifications(
          payload,
          UserType.CUSTOMER,
        );
      }
      if (
        Boolean(customer?.isActive) === true ||
        Boolean(customer?.isActive) === false
      ) {
        const status = customer.isActive
          ? 'Account Activated'
          : 'Account Deactivated';

        const context = {
          name: customer.customer.fullName,
          message: customer.isActive
            ? `<p>Your account has been activated , you can now login using your registered email and password</p> <p>If you have any question , please contact admin.</p>`
            : `<p> Unfortunately your account has been deactivated</p> <p>If you have any question, please contact admin for further assistance regarding this issue.</p>`,
          app_name: this.config.get('APP_NAME'),
          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        };

        this.mail.sendEmail(
          customer.customer.userMaster.email,
          this.config.get('MAIL_NO_REPLY'),
          status,
          'inactive',
          context,
        );
      }

      return {
        ...successResponse(200, 'Customer updated successfully.'),
        ...customer,
        activeAddress,
      };
    } catch (error) {
      return unknowError(
        422,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getVendorsByLocation(userMasterId: number, dto: VendorLocationDto) {
    const {
      page = 1,
      take = 10,
      search,
      distance = 10000000000,
      currentDay,
      vendorStatus,
      rating = 0,
    } = dto;
    try {
      const dayObj = currentDateToVendorFilter(currentDay);
      if (dto.latitude && dto.longitude) {
        const vendors: Array<{ vendorId: number }> = await this.prisma
          .$queryRaw`SELECT "public"."Vendor"."vendorId"
          FROM "public"."UserAddress"
           INNER JOIN 
           "public"."Vendor" 
           ON "public"."UserAddress"."vendorId" = "public"."Vendor"."vendorId"
            AND "public"."Vendor"."serviceType"::text = ${dto.serviceType}
         WHERE "public"."UserAddress"."isDeleted" = false 
         AND ST_Distance(geography(ST_MakePoint("public"."UserAddress"."longitude", "public"."UserAddress"."latitude")),geography(ST_MakePoint(${Number(
           dto.longitude,
         )}, ${Number(
          dto.latitude,
        )}))) < ${+distance} AND "public"."Vendor"."avgRating" >= ${rating}
        ORDER BY ST_Distance(geography(ST_MakePoint("public"."UserAddress"."longitude", "public"."UserAddress"."latitude")),geography(ST_MakePoint(${Number(
          dto.longitude,
        )}, ${Number(
          dto.latitude,
        )}))) ASC, "public"."Vendor"."avgRating" DESC Limit ${BigInt(
          take,
        )} offset ${(Number(page) - 1) * Number(take)}`;

        const vendorIds = vendors.map((vendor) => vendor.vendorId);
        let serviceIds: number[] = [];

        if (dto.services) {
          serviceIds = dto.services.map((service) => {
            return service.serviceId;
          });
        }
        const result = await this.prisma.userMaster.findMany({
          where: {
            isDeleted: false,
            isActive: true,
            vendor: {
              AND: [
                {
                  vendorId: {
                    in: vendorIds,
                  },
                },
                { serviceType: dto.serviceType },
                // { isBusy: dto.isBusy ? dto.isBusy : false },
                {
                  ...(serviceIds &&
                    serviceIds.length > 0 && {
                      vendorService: {
                        some: {
                          isDeleted: false,
                          status: VendorServiceStatus.Available,
                          serviceId: {
                            in: serviceIds,
                          },
                        },
                      },
                    }),
                },
              ],
              companySchedule: {
                some: {
                  day: dayObj.currentDay,
                  ...(vendorStatus === VendorStatus.OPEN && {
                    startTime: {
                      gte: dayObj.currentTime,
                    },
                    endTime: {
                      lt: dayObj.currentTime,
                    },
                  }),
                  ...(vendorStatus === VendorStatus.CLOSED && {
                    OR: [
                      {
                        startTime: {
                          lt: dayObj.currentTime,
                        },
                        endTime: {
                          gte: dayObj.currentTime,
                        },
                      },
                    ],
                  }),
                },
              },
              ...(vendorStatus === VendorStatus.BUSY && {
                isBusy: true,
              }),
              // companySchedule: {
              // every: {
              //   startTime: {
              //     gte:Wit
              //   }
              // }
              // },
              ...(search && {
                companyName: {
                  contains: search,
                  mode: 'insensitive',
                },
              }),
              NOT: {
                vendorService: {
                  none: {},
                },
              },
              // ...(dto.services && {
              //   vendorService: {
              //     every: {
              //       service: {
              //         serviceName: {
              //           equals: dto.services,
              //         },
              //       },
              //     },
              //   },
              // }),
            },
          },
          select: {
            userMasterId: true,
            email: true,
            phone: true,
            vendor: {
              select: {
                vendorId: true,
                vendorService: {
                  where: {
                    isDeleted: false,
                  },
                  select: {
                    service: {
                      select: {
                        serviceName: true,
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
                fullName: true,
                companyName: true,
                serviceType: true,
                isBusy: true,
                companySchedule: {
                  select: {
                    day: true,
                    endTime: true,
                    isActive: true,
                    startTime: true,
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
                avgRating: true,
                _count: {
                  select: {
                    review: true,
                  },
                },
              },
            },
          },
        });

        const totalCount = await this.prisma.userMaster.count({
          where: {
            isDeleted: false,
            isActive: true,
            vendor: {
              AND: [
                {
                  vendorId: {
                    in: vendorIds,
                  },
                },
                { serviceType: dto.serviceType },
                {
                  ...(serviceIds &&
                    serviceIds.length > 0 && {
                      vendorService: {
                        some: {
                          isDeleted: false,
                          status: VendorServiceStatus.Available,
                          serviceId: {
                            in: serviceIds,
                          },
                        },
                      },
                    }),
                },
              ],
              companySchedule: {
                some: {
                  day: dayObj.currentDay,
                  ...(vendorStatus === VendorStatus.OPEN && {
                    startTime: {
                      gte: dayObj.currentTime,
                    },
                    endTime: {
                      lt: dayObj.currentTime,
                    },
                  }),
                  ...(vendorStatus === VendorStatus.CLOSED && {
                    OR: [
                      {
                        startTime: {
                          lt: dayObj.currentTime,
                        },
                        endTime: {
                          gte: dayObj.currentTime,
                        },
                      },
                    ],
                  }),
                },
              },
              ...(vendorStatus === VendorStatus.BUSY && {
                isBusy: true,
              }),
              ...(search && {
                companyName: {
                  contains: search,
                  mode: 'insensitive',
                },
              }),
              NOT: {
                vendorService: {
                  none: {},
                },
              },
            },
          },
        });

        const mappedVendors = getVendorListingMapper(result, dayObj);

        return {
          data: mappedVendors,
          page,
          take,
          totalCount,
        };
      } else {
        const customerCity = await this.prisma.userMaster.findUnique({
          where: {
            userMasterId: userMasterId,
          },
          select: {
            customer: {
              select: {
                userAddress: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  where: {
                    cityId: { not: null },
                  },
                  select: {
                    cityId: true,
                  },
                  take: 1,
                },
              },
            },
          },
        });

        let serviceIds: number[];

        if (dto.services) {
          serviceIds = dto.services.map((service) => {
            return service.serviceId;
          });
        }

        const vendors = await this.prisma.userMaster.findMany({
          where: {
            isDeleted: false,
            isActive: true,
            isEmailVerified: true,
            vendor: {
              status: Status.APPROVED,
              serviceType: dto.serviceType,
              userAddress: {
                some: {
                  cityId: customerCity.customer.userAddress[0].cityId,
                  isDeleted: false,
                },
              },
              ...(serviceIds &&
                serviceIds.length > 0 && {
                  vendorService: {
                    some: {
                      isDeleted: false,
                      status: VendorServiceStatus.Available,
                      serviceId: {
                        in: serviceIds,
                      },
                    },
                  },
                }),
              ...(dayObj &&
                vendorStatus &&
                vendorStatus !== VendorStatus.BUSY && {
                  companySchedule: {
                    some: {
                      day: dayObj.currentDay,
                      ...(vendorStatus === VendorStatus.OPEN && {
                        startTime: {
                          lte: dayObj.currentTime,
                        },
                        endTime: {
                          gt: dayObj.currentTime,
                        },
                      }),
                      ...(vendorStatus === VendorStatus.CLOSED && {
                        OR: [
                          {
                            startTime: {
                              gt: dayObj.currentTime,
                            },
                          },
                          {
                            endTime: {
                              lte: dayObj.currentTime,
                            },
                          },
                        ],
                      }),
                    },
                  },
                }),
              ...((vendorStatus === VendorStatus.CLOSED ||
                vendorStatus === VendorStatus.OPEN) && {
                isBusy: false,
              }),
              ...(vendorStatus === VendorStatus.BUSY && {
                isBusy: true,
              }),
              ...(search && {
                companyName: {
                  contains: search,
                  mode: 'insensitive',
                },
              }),
              NOT: {
                vendorService: {
                  none: {},
                },
              },
              ...(rating && {
                avgRating: {
                  gte: rating,
                },
              }),
            },
          },
          orderBy: {
            vendor: {
              avgRating: 'desc',
            },
          },
          select: {
            userMasterId: true,
            email: true,
            phone: true,
            vendor: {
              select: {
                vendorId: true,
                vendorService: {
                  where: {
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
                },
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
                isBusy: true,
                avgRating: true,
                _count: {
                  select: {
                    review: true,
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
                companySchedule: {
                  select: {
                    day: true,
                    endTime: true,
                    isActive: true,
                    startTime: true,
                  },
                },
              },
            },
          },
        });

        const mappedVendors = getVendorListingMapper(vendors, dayObj);

        const totalCount = await this.prisma.userMaster.count({
          where: {
            isDeleted: false,
            isActive: true,
            isEmailVerified: true,
            vendor: {
              status: Status.APPROVED,
              serviceType: dto.serviceType,
              userAddress: {
                some: {
                  cityId: customerCity.customer.userAddress[0].cityId,
                  isDeleted: false,
                },
              },
              ...(serviceIds &&
                serviceIds.length > 0 && {
                  vendorService: {
                    some: {
                      isDeleted: false,
                      status: VendorServiceStatus.Available,
                      serviceId: {
                        in: serviceIds,
                      },
                    },
                  },
                }),
              ...(dayObj &&
                vendorStatus &&
                vendorStatus !== VendorStatus.BUSY && {
                  companySchedule: {
                    some: {
                      day: dayObj.currentDay,
                      ...(vendorStatus === VendorStatus.OPEN && {
                        startTime: {
                          lte: dayObj.currentTime,
                        },
                        endTime: {
                          gt: dayObj.currentTime,
                        },
                      }),
                      ...(vendorStatus === VendorStatus.CLOSED && {
                        OR: [
                          {
                            startTime: {
                              gt: dayObj.currentTime,
                            },
                          },
                          {
                            endTime: {
                              lte: dayObj.currentTime,
                            },
                          },
                        ],
                      }),
                    },
                  },
                }),
              ...((vendorStatus === VendorStatus.CLOSED ||
                vendorStatus === VendorStatus.OPEN) && {
                isBusy: false,
              }),
              ...(vendorStatus === VendorStatus.BUSY && {
                isBusy: true,
              }),
              ...(search && {
                companyName: {
                  contains: search,
                  mode: 'insensitive',
                },
              }),
              NOT: {
                vendorService: {
                  none: {},
                },
              },
              ...(rating && {
                avgRating: {
                  gte: rating,
                },
              }),
            },
          },
        });

        return {
          data: mappedVendors,
          page,
          take,
          totalCount,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(userMasterId: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: userMasterId,
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          userType: true,
          phone: true,
          createdAt: true,
          isActive: true,
          vendor: {
            select: {
              vendorId: true,
              avgRating: true,
              isBusy: true,
              companySchedule: {
                orderBy: {
                  id: 'asc',
                },
                select: {
                  id: true,
                  day: true,
                  startTime: true,
                  endTime: true,
                },
              },
              vendorService: {
                where: {
                  isDeleted: false,
                  status: VendorServiceStatus.Available,
                },
                select: {
                  vendorServiceId: true,
                  description: true,
                  service: {
                    select: {
                      serviceName: true,
                    },
                  },
                  serviceImage: {
                    select: {
                      id: true,
                      media: {
                        select: {
                          id: true,
                          key: true,
                          name: true,
                          location: true,
                        },
                      },
                    },
                  },
                },
              },
              businessLicense: {
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
              alwaysOpen: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
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
              review: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  id: true,
                  body: true,
                  rating: true,
                  createdAt: true,
                  customer: {
                    select: {
                      fullName: true,
                      userMaster: {
                        select: {
                          profilePicture: {
                            select: {
                              id: true,
                              location: true,
                              key: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              deliverySchedule: {
                select: {
                  deliveryItemMin: true,
                  deliveryItemMax: true,
                  serviceDurationMin: true,
                  serviceDurationMax: true,
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

  async getVendorServicesByVendorId(
    vendorId: number,
    dto: VendorServiceParams,
  ) {
    const { page = 1, take = 10, search } = dto;
    try {
      if (!(dto.vendorServiceId || dto.categoryId)) {
        const vendorService = await this.prisma.vendorService.findMany({
          take: +take,
          skip: +take * (+page - 1),
          where: {
            vendorId,
            status: VendorServiceStatus.Available,
            ...(search && {
              service: {
                serviceName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
            isDeleted: false,
          },
          select: {
            vendorServiceId: true,
            service: {
              select: {
                serviceId: true,
                serviceName: true,
              },
            },
          },
        });

        const totalCount = await this.prisma.vendorService.count({
          where: {
            vendorId,
            status: VendorServiceStatus.Available,
            isDeleted: false,
          },
        });

        return {
          data: vendorService,
          page: +page,
          take: +take,
          totalCount,
        };
      } else if (dto.vendorServiceId && !dto.categoryId) {
        const allocatePrice = await this.prisma.allocatePrice.findMany({
          take: +take,
          skip: +take * (+page - 1),
          where: {
            vendorServiceId: +dto.vendorServiceId,
            vendorService: { isDeleted: false },
            ...(search && {
              category: {
                categoryName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
          },
          distinct: ['categoryId'],
          select: {
            id: true,
            price: true,
            category: {
              select: {
                categoryId: true,
                categoryName: true,
              },
            },
          },
        });

        const totalCount = await this.prisma.allocatePrice.count({
          where: {
            vendorServiceId: +dto.vendorServiceId,
            vendorService: { isDeleted: false },
          },
        });

        return {
          data: allocatePrice,
          page: +page,
          take: +take,
          totalCount,
        };
      } else if (dto.vendorServiceId && dto.categoryId) {
        const allocatePrice = await this.prisma.allocatePrice.findMany({
          take: +take,
          skip: +take * (+page - 1),
          where: {
            vendorServiceId: +dto.vendorServiceId,
            categoryId: +dto.categoryId,
            vendorService: { isDeleted: false },

            ...(search && {
              subcategory: {
                subCategoryName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
          },
          distinct: ['subcategoryId'],
          select: {
            id: true,
            price: true,
            subcategory: {
              select: {
                subCategoryId: true,
                subCategoryName: true,
              },
            },
          },
        });

        const totalCount = await this.prisma.allocatePrice.count({
          where: {
            vendorServiceId: +dto.vendorServiceId,
            vendorService: { isDeleted: false },
          },
        });

        return {
          data: allocatePrice,
          page: +page,
          take: +take,
          totalCount,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getVendorServicesCarWashByVendorId(
    vendorId: number,
    dto: VendorServiceParams,
  ) {
    const { page = 1, take = 10, search } = dto;
    try {
      if (!dto.categoryId) {
        const allocatePrice = await this.prisma.allocatePrice.findMany({
          take: +take,
          skip: +take * (+page - 1),
          where: {
            vendorService: {
              vendorId,
              status: VendorServiceStatus.Available,
              isDeleted: false,
            },
            ...(search && {
              category: {
                categoryName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
          },
          distinct: ['categoryId'],
          select: {
            id: true,
            price: true,
            vendorService: {
              select: {
                vendorServiceId: true,
                service: {
                  select: {
                    serviceId: true,
                    serviceName: true,
                  },
                },
              },
            },
            category: {
              select: {
                categoryId: true,
                categoryName: true,
              },
            },
          },
        });

        const totalCount = await this.prisma.allocatePrice.count({
          where: {
            vendorService: {
              vendorId,
              status: VendorServiceStatus.Available,
              isDeleted: false,
            },
            ...(search && {
              category: {
                categoryName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
          },
        });

        return {
          data: allocatePrice,
          page: +page,
          take: +take,
          totalCount,
        };
      } else if (dto.categoryId) {
        const allocatePrice = await this.prisma.allocatePrice.findMany({
          take: +take,
          skip: +take * (+page - 1),
          where: {
            vendorService: {
              vendorId,
              status: VendorServiceStatus.Available,
              isDeleted: false,
            },

            categoryId: +dto.categoryId,

            ...(search && {
              category: {
                categoryName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
          },
          distinct: ['vendorServiceId'],
          select: {
            id: true,
            price: true,
            vendorService: {
              select: {
                vendorServiceId: true,
                service: {
                  select: {
                    serviceId: true,
                    serviceName: true,
                  },
                },
              },
            },
            category: {
              select: {
                categoryId: true,
                categoryName: true,
              },
            },
          },
        });

        const totalCount = await this.prisma.allocatePrice.count({
          where: {
            vendorService: {
              vendorId,
              status: VendorServiceStatus.Available,
              isDeleted: false,
            },

            categoryId: +dto.categoryId,

            ...(search && {
              category: {
                categoryName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
          },
        });

        return {
          data: allocatePrice,
          page: +page,
          take: +take,
          totalCount,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(id: number) {
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          isDeleted: true,
        },
      });
      if (!user.isDeleted) {
        await this.prisma.userMaster.update({
          where: {
            userMasterId: id,
          },
          data: {
            isDeleted: true,
          },
        });
        return successResponse(200, 'Customer deleted successfully.');
      } else {
        return successResponse(200, 'Customer is already deleted .');
      }
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }
}
