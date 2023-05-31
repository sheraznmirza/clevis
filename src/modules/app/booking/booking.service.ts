import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { CreateBookingDto, CustomerGetBookingsDto } from './dto';

@Injectable()
export class BookingService {
  constructor(private repository: BookingRepository) {}

  //   async updateCustomer(id: number, data: CategoryUpdateDto) {
  //     try {
  //       return await this.repository.updateCategory(id, data);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

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

  async getVendorBookings(vendorId: number, dto: CustomerGetBookingsDto) {
    try {
      return await this.repository.getVendorBookings(vendorId, dto);
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
