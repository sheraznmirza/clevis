import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { TapService } from 'src/modules/tap/tap.service';
import {
  AdminGetBookingsDto,
  BookingDetailsDto,
  CreateBookingCarWashDto,
  CreateBookingDto,
  CustomerGetBookingsDto,
  UpdateBookingStatusParam,
  VendorGetBookingsDto,
} from './dto';
import { GetUserType } from 'src/core/dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BookingService {
  constructor(
    private repository: BookingRepository,
    private tapService: TapService,
  ) {}

  async createBooking(customerId: number, dto: CreateBookingDto) {
    try {
      return await this.repository.createBooking(customerId, dto);
    } catch (error) {
      throw error;
    }
  }

  async createBookingCarWash(customerId: number, dto: CreateBookingCarWashDto) {
    try {
      return await this.repository.createBookingCarWash(customerId, dto);
    } catch (error) {
      throw error;
    }
  }

  async getCustomerBookings(customerId: number, dto: CustomerGetBookingsDto) {
    try {
      return await this.repository.getCustomerBookings(customerId, dto);
    } catch (error) {
      throw error;
    }
  }

  async getVendorBookings(vendorId: number, dto: VendorGetBookingsDto) {
    try {
      return await this.repository.getVendorBookings(vendorId, dto);
    } catch (error) {
      throw error;
    }
  }

  async getCustomerBookingById(bookingMasterId: number) {
    try {
      return await this.repository.getCustomerBookingById(bookingMasterId);
    } catch (error) {
      throw error;
    }
  }

  async getVendorBookingById(bookingMasterId: number) {
    try {
      return await this.repository.getVendorBookingById(bookingMasterId);
    } catch (error) {
      throw error;
    }
  }

  async updateVendorBookingStatus(
    bookingMasterId: number,
    dto: UpdateBookingStatusParam,
    user: GetUserType,
  ) {
    try {
      return await this.repository.updateVendorBookingStatus(
        bookingMasterId,
        dto,
        user,
      );
    } catch (error) {
      throw error;
    }
  }

  async getAdminBookingById(bookingMasterId: number) {
    try {
      return await this.repository.getAdminBookingById(bookingMasterId);
    } catch (error) {
      throw error;
    }
  }

  async getAdminBookings(dto: AdminGetBookingsDto) {
    try {
      const rawBookings = await this.repository.getAdminBookings(dto);

      const cleanedBooking = rawBookings.data.map((booking) => {
        const data = {
          ...booking,
          pickupDelivery: booking.pickupTimeFrom ? true : false,
        };
        delete data.pickupTimeFrom;
        return data;
      });

      rawBookings.data = cleanedBooking;
      return rawBookings;
    } catch (error) {
      throw error;
    }
  }

  async getBookingDetails(user: GetUserType, dto: BookingDetailsDto) {
    try {
      return await this.repository.getBookingDetails(user, dto);
    } catch (error) {
      throw error;
    }
  }

  async VendorDetail(vendorId: number) {
    try {
      return await this.repository.getDetailVendor(vendorId);
    } catch (error) {
      throw error;
    }
  }

  @Cron('10 * * * * *')
  async timeOut() {
    try {
      console.log('below job');
    } catch (error) {
      throw error;
    }
  }

  //   async deleteCustomer(id: number) {
  //     try {
  //       return await this.repository.deleteCustomer(id);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }
}
