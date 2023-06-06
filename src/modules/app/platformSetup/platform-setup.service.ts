import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { PlatFormSetupDto } from './dto/platform-setup.dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { ERROR_MESSAGE } from 'src/core/constants';

@Injectable()
export class PlatformSetupService {
  constructor(private prisma: PrismaService) {}

  async getPlatormById(id: number) {
    try {
      const result = await this.prisma.platformSetup.findUnique({
        where: {
          id: id,
        },
        select: {
          fee: true,
          id: true,
        },
      });

      if (result) {
        return result;
      } else {
        throw unknowError(417, {}, 'PlatformID does not exist');
      }
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
    }
  }

  async getAllPlatform() {
    try {
      return await this.prisma.platformSetup.findMany({
        where: {
          isDeleted: false,
        },

        select: {
          id: true,
          fee: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // async deletePlatform(id: number) {
  //   try {
  //     await this.prisma.platformSetup.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         isDeleted: true,
  //       },
  //     });
  //     return successResponse(200, 'platform Successfully deleted');
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async createPlatform(dto: PlatFormSetupDto) {
    try {
      await this.prisma.platformSetup.create({
        data: {
          fee: dto.fee,
        },
      });
      return successResponse(201, 'platform Successfully Created');
    } catch (error) {
      throw error;
    }
  }

  async updatePlatform(id: number, data: PlatFormSetupDto) {
    try {
      const result = await this.prisma.platformSetup.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });
      if (result) {
        const solve = await this.prisma.platformSetup.create({
          data: {
            fee: data.fee,
          },
        });
        return {
          ...successResponse(201, 'PlatformID Successfully updated '),
          ...solve,
        };
      } else {
        throw unknowError(400, {}, ' PlatFormID does not exists');
      }
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
    }
  }
}
