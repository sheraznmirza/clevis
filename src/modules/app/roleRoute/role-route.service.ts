import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { RoleRouteCreateDto } from './dto';
import { successResponse } from '../../../helpers/response.helper';

@Injectable()
export class RoleRouteService {
  constructor(private prisma: PrismaService) {}

  async createRoleRoute(dto: RoleRouteCreateDto) {
    try {
      const roleRoute = await this.prisma.roleRouteMapping.create({
        data: {
          roleId: dto.roleId,
          routeId: dto.routeId,
        },
      });
      if (!roleRoute) {
        throw new BadRequestException('Unable to create this service');
      }
      return successResponse(201, 'Role-Route successfully created');
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

  async getAllRoleRoute() {
    try {
      return await this.prisma.roleRouteMapping.findMany();
    } catch (error) {
      throw error;
    }
  }

  // async deleteService(id: number) {
  //   try {
  //     return await this.prisma.deleteService(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
