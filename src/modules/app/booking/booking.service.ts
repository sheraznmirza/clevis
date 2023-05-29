import { Injectable } from '@nestjs/common';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import {
  CustomerListingParams,
  CustomerVendorListingParams,
  ListingParams,
} from '../../../core/dto';
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

  async getBookings(customerId: number, dto: CustomerGetBookingsDto) {
    try {
      return await this.repository.getBookings(customerId, dto);
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
