import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import {
  AdminGetBookingsDto,
  BookingDetailsDto,
  CreateBookingDto,
  CustomerGetBookingsDto,
  UpdateBookingStatusParam,
  VendorGetBookingsDto,
} from './dto';

@Injectable()
export class BookingService {
  constructor(private repository: BookingRepository) {}

  async createBooking(customerId: number, dto: CreateBookingDto) {
    try {
      return await this.repository.createBooking(customerId, dto);
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
  ) {
    try {
      return await this.repository.updateVendorBookingStatus(
        bookingMasterId,
        dto,
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

  async getBookingDetails(dto: BookingDetailsDto) {
    try {
      return await this.repository.getBookingDetails(dto);
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
