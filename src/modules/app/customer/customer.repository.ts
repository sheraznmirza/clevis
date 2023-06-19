import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import {
  CustomerListingParams,
  CustomerVendorListingParams,
} from '../../../core/dto';
import { Media, Status, UserType } from '@prisma/client';
import {
  UpdateCustomerDto,
  VendorLocationDto,
  VendorServiceParams,
  VendorStatus,
} from './dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { subcategories } from './entities/subcategoriesType';
import { currentDateToVendorFilter } from 'src/helpers/date.helper';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  async getCustomerById(id: number) {
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
    const { page = 1, take = 10, search } = listingParams;
    try {
      const customers = await this.prisma.userMaster.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          isDeleted: false,
          userType: UserType.CUSTOMER,
          ...(search && {
            customer: {
              fullName: {
                contains: search,
              },
            },
          }),
        },
        select: {
          userMasterId: true,
          phone: true,
          email: true,
          userType: true,
          customer: {
            select: {
              customerId: true,
              fullName: true,
              userAddress: {
                where: {
                  isDeleted: false,
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
          isEmailVerified: true,
          isDeleted: false,
          userType: UserType.CUSTOMER,
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
      vendorStatus = VendorStatus.OPEN,
    } = dto;
    try {
      const dayObj = currentDateToVendorFilter(currentDay);
      if (dto.latitude && dto.longitude) {
        const vendors: Array<{ vendorId: number }> = await this.prisma
          .$queryRaw`select "public"."Vendor"."vendorId" from "public"."UserAddress" INNER JOIN "public"."Vendor" ON "public"."UserAddress"."vendorId" = "public"."Vendor"."vendorId" AND "public"."Vendor"."serviceType"::text = ${
          dto.serviceType
        } where ST_Distance(geography(ST_MakePoint("public"."UserAddress"."longitude", "public"."UserAddress"."latitude")),geography(ST_MakePoint(${Number(
          dto.longitude,
        )}, ${Number(dto.latitude)}))) < ${+distance}
        ORDER BY ST_Distance(geography(ST_MakePoint("public"."UserAddress"."longitude", "public"."UserAddress"."latitude")),geography(ST_MakePoint(${Number(
          dto.longitude,
        )}, ${Number(dto.latitude)}))) ASC Limit ${BigInt(take)} offset ${
          (Number(page) - 1) * Number(take)
        }`;

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

        const totalCount = await this.prisma.userMaster.count({
          where: {
            isEmailVerified: true,
            isDeleted: false,
            userType: UserType.VENDOR,
            vendor: {
              serviceType: dto.serviceType,

              NOT: {
                vendorService: {
                  none: {},
                },
              },
            },
          },
        });

        return {
          data: result,
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
        console.log(
          'customerCity.customer.userAddress[0].cityId: ',
          customerCity.customer.userAddress[0].cityId,
        );

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
                  // cityId: customerCity.customer.userAddress[0].cityId,
                  cityId: 32,
                  isDeleted: false,
                },
              },
              ...(serviceIds &&
                serviceIds.length > 0 && {
                  vendorService: {
                    some: {
                      serviceId: {
                        in: serviceIds,
                      },
                    },
                  },
                }),

              // companySchedule: {
              //   some: {
              //     day: dayObj.currentDay,
              //     ...(vendorStatus === VendorStatus.OPEN && {
              //       startTime: {
              //         gte: dayObj.currentTime,
              //       },
              //       endTime: {
              //         lt: dayObj.currentTime,
              //       },
              //     }),
              //     ...(vendorStatus === VendorStatus.CLOSED && {
              //       OR: [
              //         {
              //           startTime: {
              //             lt: dayObj.currentTime,
              //           },
              //           endTime: {
              //             gte: dayObj.currentTime,
              //           },
              //         },
              //       ],
              //     }),
              //   },
              // },
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
          orderBy: {
            vendor: {
              companyName: 'asc',
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

        const totalCount = await this.prisma.userMaster.count({
          where: {
            isEmailVerified: true,
            isDeleted: false,
            userType: UserType.VENDOR,
            vendor: {
              serviceType: dto.serviceType,
              userAddress: {
                some: {
                  cityId: customerCity.customer.userAddress[0].cityId,
                  isDeleted: false,
                },
              },

              NOT: {
                vendorService: {
                  none: {},
                },
              },
            },
          },
        });

        return {
          data: vendors,
          page,
          take,
          totalCount,
          customerCity,
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

            ...(search && {
              service: {
                serviceName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }),
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
        // const vendorService = await this.prisma.vendorService.findMany({
        //   take: +take,
        //   skip: +take * (+page - 1),
        //   where: {
        //     vendorId,
        //     ...(search && {
        //       service: {
        //         serviceName: {
        //           contains: search,
        //           mode: 'insensitive',
        //         },
        //       },
        //     }),
        //   },
        //   select: {
        //     vendorServiceId: true,
        //     AllocatePrice: {
        //       select: {
        //         id: true,
        //         category: {
        //           select: {
        //             categoryId: true,
        //             categoryName: true,
        //           },
        //         },
        //       },
        //     },
        //     // service: {
        //     //   select: {
        //     //     serviceId: true,
        //     //     serviceName: true,
        //     //   },
        //     // },
        //   },
        // });

        const allocatePrice = await this.prisma.allocatePrice.findMany({
          take: +take,
          skip: +take * (+page - 1),
          where: {
            vendorService: {
              vendorId,
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
          // distinct: ['categoryId'],
          select: {
            id: true,
            price: true,
            vendorService: {
              select: {
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
            categoryId: +dto.categoryId,
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
