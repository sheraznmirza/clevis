import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { async } from 'rxjs';
import { CustomerListingParams } from 'src/core/dto';
import { PlatFormSetupDto } from './dto/platform-setup.dto';
import { successResponse } from 'src/helpers/response.helper';

@Injectable()
export class PlatformSetupService {
  constructor(private prisma: PrismaService) {}

  async getPlatormById(id: number) {
    try {
      return await this.prisma.platformSetup.findUnique({
        where: {
          id: id,
        },
        select: {
          fee: true,
          id: true,
        },
      });
    } catch (error) {
      throw error;
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
      });
    } catch (error) {
      throw error;
    }
  }

  async deletePlatform(id: number) {
    try {
      await this.prisma.platformSetup.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });
      return successResponse(200, 'platform Successfully deleted');
    } catch (error) {
      throw error;
    }
  }

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
      await this.prisma.platformSetup.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });

      await this.prisma.platformSetup.create({
        data: {
          fee: data.fee,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
