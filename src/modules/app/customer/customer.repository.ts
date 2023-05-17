import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import {
  CustomerListingParams,
  CustomerVendorListingParams,
} from '../../../core/dto';
import { Media, UserType } from '@prisma/client';
import { UpdateCustomerDto, VendorLocationDto } from './dto';
import { successResponse } from 'src/helpers/response.helper';

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
      return await this.prisma.userMaster.findFirst({
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
    } catch (error) {
      return false;
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
      if (dto.profilePicture) {
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
      throw error;
    }
  }

  async getVendorsByLocation(dto: VendorLocationDto) {
    const { page = 1, take = 10, search, distance = 500 } = dto;
    try {
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
              {},
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
          vendor: {
            select: {
              fullName: true,
              companyName: true,
              logo: {
                select: {
                  key: true,
                  id: true,
                  name: true,
                  location: true,
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
        },
      });

      return {
        ...result,
        page,
        take,
        totalCount,
      };
    } catch (error) {
      debugger;
      throw error;
    }
  }

  async deleteCustomer(id: number) {
    try {
      await this.prisma.userMaster.update({
        where: {
          userMasterId: id,
        },
        data: {
          isDeleted: true,
        },
      });
      return successResponse(200, 'Customer deleted successfully.');
    } catch (error) {
      return false;
    }
  }
}
