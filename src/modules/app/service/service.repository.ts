import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ServiceCreateDto, ServiceUpdateDto } from './dto';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async createService(data: ServiceCreateDto) {
    try {
      const service = await this.prisma.services.create({
        data: {
          serviceName: data.serviceName,
          serviceType: data.serviceType,
        },
        select: { serviceId: true },
      });

      data.category.forEach(async (ctx) => {
        await this.prisma.category.create({
          data: {
            categoryName: ctx.categoryName,
            serviceId: service.serviceId,
            ...(ctx.subCategories.length && {
              subCategory: { createMany: { data: ctx.subCategories } },
            }),
          },
        });
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async updateService(data: ServiceUpdateDto) {
    try {
      // await this.prisma.services.update({
      //   where: {
      //     serviceId: data.serviceId
      //   },
      //   data: {
      //     category: {
      //       upsert: {
      //         where: {
      //           categoryId: data.
      //         },
      //         update: {
      //         },
      //         create: {
      //         },
      //       }
      //     }
      //   }
      // })
      // return await this.prisma.services.update({
      //   data: {
      //     serviceName: data.serviceName,
      //     serviceType: data.serviceType,
      //     category: {
      //       update: {
      //         categoryName: data.categoryName,
      //         ...(data.subCategory.length && {
      //           subCategory: {
      //             updateMany: {
      //               data: data.subCategory,
      //             },
      //           },
      //         }),
      //       },
      //     },
      //   },
      //   where: {
      //     serviceId: data.serviceId,
      //   },
      // });
    } catch (error) {
      return false;
    }
  }
}
