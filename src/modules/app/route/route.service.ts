import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { RouteCreateDto } from './dto';
import { successResponse } from '../../../helpers/response.helper';

@Injectable()
export class RouteService {
  constructor(private prisma: PrismaService) {}

  async createRoute(dto: RouteCreateDto) {
    try {
      const route = await this.prisma.routes.create({
        data: {
          icon: dto.icon,
          label: dto.label,
          linkTo: dto.linkTo,
          routeName: dto.routeName,
          selectedOptionKey: dto.selectedOptionKey,
        },
      });
      if (!route) {
        throw new BadRequestException('Unable to create this route');
      }
      return successResponse(201, 'Route created successfully');
    } catch (error) {
      throw error;
    }
  }

  // async updateService(id: number, data: ServiceUpdateDto) {
  //   try {
  //     return await this.prisma.updateService(id, data);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async getService(id: number) {
  //   try {
  //     return await this.prisma.getService(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getAllRoute() {
    try {
      return await this.prisma.routes.findMany();
    } catch (error) {}
  }

  // async deleteService(id: number) {
  //   try {
  //     return await this.prisma.deleteService(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
