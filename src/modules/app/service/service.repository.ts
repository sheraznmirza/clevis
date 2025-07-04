import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { ServiceCreateDto, ServiceUpdateDto } from './dto';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { count } from 'console';
import { ERROR_MESSAGE } from 'src/core/constants';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async createService(data: ServiceCreateDto) {
    try {
      const service = await this.prisma.services.count({
        where: {
          serviceName: data.serviceName,
          serviceType: data.serviceType,
        },
      });
      if (service < 1) {
        await this.prisma.services.create({
          data: {
            serviceName: data.serviceName,
            serviceType: data.serviceType,
          },
        });
        return { statusCode: 201, message: 'Service Successfully Created' };
      } else {
        return unknowError(417, service, 'Service Already Exists');
      }
    } catch (error) {
      unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
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
      const service = await this.prisma.services.findUnique({
        where: {
          serviceId: id,
        },
      });
      if (service) return service;
      else return unknowError(417, service, 'No Services Found');
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
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
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteService(id: number) {
    try {
      const vendorService = await this.prisma.services.findUnique({
        where: {
          serviceId: id,
        },
        select: {
          isDeleted: true,
        },
      });
      if (vendorService?.isDeleted)
        throw new BadRequestException('Service is already deleted.');
      if (vendorService?.isDeleted === undefined)
        throw new BadRequestException("Service doesn't exist.");
      await this.prisma.services.update({
        where: {
          serviceId: id,
        },
        data: {
          isDeleted: true,
        },
      });

      // const count = await this.prisma.vendorService.count({
      //   where: {
      //     serviceId: id,
      //     isDeleted: true,
      //   },
      // });

      return successResponse(202, 'successfully deleted');
    } catch (error) {
      return unknowError(error?.status, error, ERROR_MESSAGE.MSG_417);
    }
  }
}
