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
      const ratings = await this.prisma.ratingSetup.findMany({
        where: {
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          rating: true,
          serviceType: true,
          id: true,
        },
      });

      return {
        carWashRating:
          (ratings && ratings.length > 1 && ratings[0].rating) || 50,
        laundryRating:
          (ratings && ratings.length > 1 && ratings[1].rating) || 50,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateRating(data: RatingSetupDto) {
    try {
      await this.prisma.ratingSetup.updateMany({
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

      return {
        ...successResponse(200, 'Rating updated successfully.'),
        carWashRating: data.carWashRating,
        laundryRating: data.laundryRating,
      };
    } catch (error) {
      throw error;
    }
  }
}
