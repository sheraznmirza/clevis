import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { ServiceCreateDto, ServiceUpdateDto } from './dto';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async createService(data: ServiceCreateDto) {
    try {
      await this.prisma.services.create({
        data: {
          serviceName: data.serviceName,
          serviceType: data.serviceType,
        },
      });

      // data.category.forEach(async (ctx) => {
      //   await this.prisma.category.create({
      //     data: {
      //       categoryName: ctx.categoryName,
      //       serviceId: service.serviceId,
      //       ...(ctx.subCategories.length && {
      //         subCategory: { createMany: { data: ctx.subCategories } },
      //       }),
      //     },
      //   });
      // });

      return true;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Service is already created');
      }
      return false;
    }
  }

  async updateService(id: number, data: ServiceUpdateDto) {
    try {
      const service = await this.prisma.services.update({
        where: {
          serviceId: id,
        },
        data: {
          ...(data.serviceName && { serviceName: data.serviceName }),
          ...(data.serviceType && { serviceType: data.serviceType }),
        },
      });
      return {
        ...successResponse(200, 'Service updated successfully.'),
        ...service,
      };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getService(id: number) {
    try {
      return await this.prisma.services.findUnique({
        where: {
          serviceId: id,
        },
      });
    } catch (error) {
      return false;
    }
  }

  // async getAllService(page: number, take: number, search?: string) {
  //   try {
  //     return await this.prisma.services.findMany({
  //       take,
  //       skip: take * page,
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //       ...(search.length && {
  //         where: {
  //           isDeleted: false,
  //           serviceName: {
  //             contains: search,
  //           },
  //         },
  //       }),
  //     });
  //   } catch (error) {
  //     return false;
  //   }
  // }

  async getAllService(listingParams: ServiceCategorySubCategoryListingParams) {
    const { page = 1, take = 10, search, serviceType } = listingParams;
    try {
      const services = await this.prisma.services.findMany({
        where: {
          isDeleted: false,

          ...(serviceType && {
            serviceType: serviceType,
          }),

          ...(search && {
            serviceName: {
              contains: search,
            },
          }),
        },
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          serviceId: true,
          serviceName: true,
          serviceType: true,
        },
      });

      const totalCount = await this.prisma.services.count({
        where: {
          isDeleted: false,
          ...(serviceType && {
            serviceType: serviceType,
          }),
        },
      });

      return {
        data: services,
        page,
        take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteService(id: number) {
    try {
      await this.prisma.services.update({
        where: {
          serviceId: id,
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
