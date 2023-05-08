import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { RoleCreateDto } from './dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async createRole(dto: RoleCreateDto) {
    try {
      const role = await this.prisma.role.create({
        data: {
          name: dto.name,
          userType: dto.userType,
        },
      });

      if (!role) {
        throw new BadRequestException('Unable to create this role');
      }
      return { statusCode: 201, message: 'Role Successfully Created' };
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

  async getAllRoles() {
    try {
      return await this.prisma.role.findMany({
        select: {
          id: true,
          name: true,
          userType: true,
        },
      });
    } catch (error) {}
  }

  async deleteAllRoles() {
    try {
      return await this.prisma.role.deleteMany();
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
