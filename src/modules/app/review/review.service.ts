import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetUserType } from 'src/core/dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { successResponse } from 'src/helpers/response.helper';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(user: GetUserType, createReviewDto: CreateReviewDto) {
    try {
      const booking = await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: createReviewDto.bookingMasterId,
        },
        select: {
          status: true,
          vendor: {
            select: {
              review: {
                where: {
                  customerId: user.userTypeId,
                },
              },
            },
          },
        },
      });

      if (booking.status !== BookingStatus.Completed) {
        throw new BadRequestException(
          'Booking needs to be completed before it can be reviewed.',
        );
      }

      if (booking?.vendor?.review?.length > 0) {
        throw new BadRequestException(
          'You have already given this booking a review.',
        );
      }

      await this.prisma.review.create({
        data: {
          ...(createReviewDto.body && {
            body: createReviewDto.body,
          }),
          rating: createReviewDto.rating,
          customerId: user.userTypeId,
          vendorId: createReviewDto.vendorId,
        },
      });

      const avgRating = await this.prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      });

      if (avgRating?._avg?.rating) {
        await this.prisma.vendor.update({
          where: {
            vendorId: createReviewDto.vendorId,
          },
          data: {
            avgRating: avgRating._avg.rating,
          },
        });
      }

      return successResponse(201, 'Review successfully created');
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Booking or Vendor does not exist');
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    user: GetUserType,
  ) {
    try {
      const findReview = await this.prisma.review.findUnique({
        where: {
          id,
        },
        select: {
          customerId: true,
        },
      });
      if (findReview.customerId !== user.userTypeId) {
        throw new ForbiddenException(
          'You are not permitted to update this review',
        );
      }
      const review = await this.prisma.review.update({
        where: {
          id: id,
        },
        data: {
          ...(updateReviewDto.body && {
            body: updateReviewDto.body,
          }),
          rating: updateReviewDto.rating,
        },
        select: {
          body: true,
          id: true,
          rating: true,
        },
      });
      return {
        ...successResponse(200, 'Review updated successfully'),
        ...review,
      };
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Review does not exist');
      }
      throw error;
    }
  }

  async remove(id: string, user: GetUserType) {
    try {
      const findReview = await this.prisma.review.findUnique({
        where: {
          id,
        },
        select: {
          customerId: true,
          isDeleted: true,
        },
      });
      if (findReview.customerId !== user.userTypeId) {
        throw new ForbiddenException(
          'You are not permitted to delete this review.',
        );
      }

      if (findReview.isDeleted) {
        throw new BadRequestException('Review is already deleted.');
      }

      await this.prisma.review.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
        select: {
          body: true,
          id: true,
          rating: true,
        },
      });
      successResponse(200, 'Review deleted successfully');
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Review does not exist');
      }
      throw error;
    }
  }
}
