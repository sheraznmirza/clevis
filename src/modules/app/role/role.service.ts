import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { RoleCreateDto } from './dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';

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
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          userType: true,
        },
      });
    } catch (error) {}
  }

  async deleteAllRoles(id: number) {
    try {
      const remove = await this.prisma.role.findFirst({
        where: {
          id: id,
        },
        select: {
          isDeleted: true,
        },
      });

      if (!remove.isDeleted) {
        await this.prisma.role.update({
          where: {
            id: id,
          },
          data: {
            isDeleted: true,
          },
        });
        return successResponse(200, 'Role deleted successfully.');
      } else {
        return successResponse(200, 'Role already deleted .');
      }
    } catch (error) {
      unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }
}
