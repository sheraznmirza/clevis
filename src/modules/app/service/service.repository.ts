import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ServiceCreateDto } from './dto';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async createService(data: ServiceCreateDto) {
    if (data.subCategory.length) {
      return await this.prisma.services.create({
        data: {
          serviceName: data.serviceName,
          serviceType: data.serviceType,
          category: {
            create: {
              categoryName: data.categoryName,
              subCategory: {
                createMany: {
                  data: data.subCategory,
                },
              },
            },
          },
        },
      });
    }
    return await this.prisma.services.create({
      data: {
        serviceName: data.serviceName,
        serviceType: data.serviceType,
        category: {
          create: {
            categoryName: data.categoryName,
          },
        },
      },
    });
  }
}
