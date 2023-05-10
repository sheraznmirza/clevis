import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import { CustomerListingParams } from '../../../core/dto';
import { UserType } from '@prisma/client';

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
          ...(search.length && {
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
      return false;
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
