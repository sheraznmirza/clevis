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
} from './dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  //   async createCategory(data: CategoryCreateDto) {
  //     try {
  //       await this.prisma.category.create({
  //         data: {
  //           categoryName: data.categoryName,
  //           serviceType: data.serviceType,
  //         },
  //       });

  //       return true;
  //     } catch (error) {
  //       if (error.code === 'P2002') {
  //         throw new ForbiddenException('Category is already created');
  //       }
  //       return false;
  //     }
  //   }

  //   async updateCustomer(id: number, data: CategoryUpdateDto) {
  //     try {
  //       await this.prisma.category.update({
  //         where: {
  //           categoryId: id,
  //         },
  //         data: {
  //           ...(data.categoryName && { categoryName: data.categoryName }),
  //           ...(data.serviceType && { serviceType: data.serviceType }),
  //         },
  //       });
  //     } catch (error) {
  //       return false;
  //     }
  //   }

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

          customer: {
            select: {
              fullName: true,
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

      return customer;
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
        page,
        take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(userMasterId: number, dto: UpdateCustomerDto) {
    try {
      let media: Media;
      if (dto.profilePicture.hasOwnProperty('location')) {
        media = await this.prisma.media.create({
          data: {
            name: dto.profilePicture.name,
            key: dto.profilePicture.key,
            location: dto.profilePicture.location,
          },
        });
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
              ...(dto.userAddressId && {
                userAddress: {
                  update: {
                    where: {
                      userAddressId: dto.userAddressId,
                    },
                    data: {
                      isDeleted: true,
                    },
                  },
                },
              }),
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
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isActive: true,
          phone: true,
          profilePicture: {
            select: {
              id: true,
              name: true,
              location: true,
              key: true,
            },
          },
          customer: {
            select: {
              customerId: true,
              fullName: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
                select: {
                  isDeleted: true,
                  userAddressId: true,
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
      return {
        ...successResponse(200, 'Customer updated successfully.'),
        ...customer,
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
    const { page = 1, take = 10, search, distance = 10000000000 } = dto;
    try {
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
              ],

              companySchedule: {
                // every: {
                //   startTime: {
                //     gte:Wit
                //   }
                // }
              },
              ...(search && {
                companyName: {
                  contains: search,
                },
              }),
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
                  where: {
                    isActive: true,
                    isDeleted: false,
                  },
                  select: {
                    cityId: true,
                  },
                  // select: {
                  //   cityId: true,
                  // },
                },
              },
            },
          },
        });

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
            },
          },
        });

        return {
          data: vendors,
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
    // dto: VendorServiceParams,
  ) {
    // const { page = 1, take = 10, search } = dto;
    try {
      const vendorService = await this.prisma.vendorService.findMany({
        // take: +take,
        // skip: +take * (+page - 1),
        where: {
          vendorId,
        },
        select: {
          vendorServiceId: true,
          vendorId: true,
          service: {
            select: {
              serviceId: true,
              serviceName: true,
            },
          },
          // AllocatePrice: {
          //   select: {
          //     id: true,
          //     vendorServiceId: true,
          //     category: {
          //       select: {
          //         categoryId: true,
          //         categoryName: true,
          //       },
          //     },
          //     subcategory: {
          //       select: {
          //         subCategoryName: true,
          //         subCategoryId: true,
          //       },
          //     },
          //     price: true,
          //   },
          // },
        },
      });
      const vendorServiceIds = vendorService.map(
        (item) => item.vendorServiceId,
      );

      const categories = await this.prisma.allocatePrice.findMany({
        where: {
          vendorServiceId: {
            in: vendorServiceIds,
          },
        },
        distinct: ['vendorServiceId'],
        select: {
          id: true,
          vendorServiceId: true,
          category: {
            select: {
              categoryId: true,
              categoryName: true,
            },
          },
          price: true,
        },
      });

      const subcategories = await this.prisma.allocatePrice.findMany({
        where: {
          vendorServiceId: {
            in: vendorServiceIds,
          },
        },
        distinct: ['vendorServiceId'],
        select: {
          id: true,
          vendorServiceId: true,
          subcategory: {
            select: {
              subCategoryId: true,
              subCategoryName: true,
            },
          },
          price: true,
        },
      });

      return { vendorService, categories, subcategories };
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
