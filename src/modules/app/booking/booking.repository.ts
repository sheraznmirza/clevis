import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { CreateBookingDto, CustomerGetBookingsDto } from './dto';
import { UserAddress } from '@prisma/client';

@Injectable()
export class BookingRepository {
  constructor(private prisma: PrismaService) {}

  async createBooking(customerId, dto: CreateBookingDto) {
    try {
      let pickupLocationId: UserAddress;
      let dropoffLocationId: UserAddress;

      if (!dto.pickupLocation.userAddressId) {
        pickupLocationId = await this.prisma.userAddress.create({
          data: {
            latitude: dto.pickupLocation.latitude,
            longitude: dto.pickupLocation.longitude,
            cityId: dto.pickupLocation.cityId,
            customerId,
            fullAddress: dto.pickupLocation.fullAddress,
          },
        });
      }

      if (!dto.dropoffLocation.userAddressId) {
        dropoffLocationId = await this.prisma.userAddress.create({
          data: {
            latitude: dto.dropoffLocation.latitude,
            longitude: dto.dropoffLocation.longitude,
            cityId: dto.dropoffLocation.cityId,
            customerId,
            fullAddress: dto.dropoffLocation.fullAddress,
          },
        });
      }

      return await this.prisma.bookingMaster.create({
        data: {
          customerId,
          vendorId: dto.vendorId,
          pickupLocationId:
            pickupLocationId.userAddressId || dto.pickupLocation.userAddressId,
          bookingDate: dto.date,
          ...(dto.instructions && { instructions: dto.instructions }),
          total: 2,
          dropffLocationId:
            dropoffLocationId.userAddressId ||
            dto.dropoffLocation.userAddressId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getBookings(customerId: number, dto: CustomerGetBookingsDto) {
    const { page = 1, take = 10, search } = dto;
    try {
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          customerId: customerId,

          // ...(search && {

          // })
        },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          isDeleted: true,
        },
      });
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async deleteBooking(id: number) {
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          isDeleted: true,
        },
      });
      if (!user.isDeleted) {
        await this.prisma.userMaster.update({
          where: {
            userMasterId: id,
          },
          data: {
            isDeleted: true,
          },
        });
        return successResponse(200, 'Customer deleted successfully.');
      } else {
        return successResponse(200, 'Customer is already deleted .');
      }
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }
}
