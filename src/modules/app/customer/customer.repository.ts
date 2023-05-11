import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import { CustomerListingParams } from '../../../core/dto';
import { Media, UserType } from '@prisma/client';
import { UpdateCustomerDto } from './dto';

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
          phone: true,
          email: true,
          userType: true,
          customer: {
            select: {
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

      return await this.prisma.userMaster.update({
        where: {
          userMasterId: userMasterId,
        },
        data: {
          phone: dto.phone !== null ? dto.phone : undefined,
          profilePictureId: media.id ? media.id : undefined,
          customer: {
            update: {
              fullName: dto.fullName !== null ? dto.fullName : undefined,
              userAddress: {
                ...(dto.userAddressId &&
                  dto.fullAddress &&
                  dto.cityId &&
                  dto.longitude &&
                  dto.latitude && {
                    update: {
                      where: {
                        userAddressId: dto.userAddressId,
                      },
                      data: {
                        isDeleted: true,
                      },
                    },
                    create: {
                      fullAddress: dto.fullAddress,
                      cityId: dto.cityId,
                      latitude: dto.latitude,
                      longitude: dto.longitude,
                    },
                  }),
              },
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
    } catch (error) {
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
      return true;
    } catch (error) {
      return false;
    }
  }
}
