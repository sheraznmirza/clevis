import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { async } from 'rxjs';
import { RatingSetupDto } from './dto/ratingsetup.dto';
import { successResponse } from 'src/helpers/response.helper';

@Injectable()
export class RatingSetup {
  constructor(private prisma: PrismaService) {}

  async getRatingById(id: number) {
    try {
      return await this.prisma.ratingSetup.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          rating: true,
          serviceType: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllRating() {
    try {
      return await this.prisma.ratingSetup.findMany({
        where: {
          isDeleted: false,
        },
        select: {
          rating: true,
          serviceType: true,
          id: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteRating(id: number) {
    try {
      await this.prisma.ratingSetup.update({
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

  async createRating(data: RatingSetupDto) {
    try {
      await this.prisma.ratingSetup.create({
        data: {
          rating: data.rating,
          serviceType: data.serviceType,
        },
      });
      return successResponse(200, 'platform Successfully deleted');
    } catch (error) {
      throw error;
    }
  }

  async updateRating(id: number, data: RatingSetupDto) {
    try {
      await this.prisma.platformSetup.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });

      await this.prisma.ratingSetup.create({
        data: {
          rating: data.rating,
          serviceType: data.serviceType,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
