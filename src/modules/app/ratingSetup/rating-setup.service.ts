import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { RatingSetupDto } from './dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class RatingSetupService {
  constructor(private prisma: PrismaService) {}

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

  async updateRating(data: RatingSetupDto) {
    try {
      await this.prisma.platformSetup.updateMany({
        data: {
          isDeleted: true,
        },
      });

      await this.prisma.ratingSetup.createMany({
        data: [
          {
            rating: data.carWashRating,
            serviceType: ServiceType.CAR_WASH,
          },
          {
            rating: data.laundryRating,
            serviceType: ServiceType.LAUNDRY,
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }
}
