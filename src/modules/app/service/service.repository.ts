import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ServiceCreateDto, ServiceUpdateDto } from './dto';
import { ListingParams } from 'src/core/dto';

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
      await this.prisma.services.update({
        where: {
          serviceId: id,
        },
        data: {
          ...(data.serviceName && { serviceName: data.serviceName }),
          ...(data.serviceType && { serviceType: data.serviceType }),
        },
      });
    } catch (error) {
      return false;
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

  async getAllService(listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      const services = await this.prisma.services.findMany({
        where: {
          isDeleted: false,
        },
        take: take,
        skip: take * (page - 1),
        orderBy: {
          createdAt: 'desc',
        },
        ...(search.length && {
          where: {
            isDeleted: false,
            serviceName: {
              contains: search,
            },
          },
        }),
      });

      return {
        ...services,
        page,
        take,
        totalCount: await this.prisma.services.count(),
      };
    } catch (error) {
      return false;
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
