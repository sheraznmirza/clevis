import { Injectable } from '@nestjs/common';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import { CustomerListingParams } from '../../../core/dto';
import { CustomerRepository } from './customer.repository';
import { UpdateCustomerDto, VendorLocationDto } from './dto';
import dayjs from 'dayjs';

@Injectable()
export class CustomerService {
  constructor(private repository: CustomerRepository) {}

  //   async updateCustomer(id: number, data: CategoryUpdateDto) {
  //     try {
  //       return await this.repository.updateCategory(id, data);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  async getCustomerById(id: number) {
    try {
      return await this.repository.getCustomerById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(userMasterId: number, dto: UpdateCustomerDto) {
    try {
      return await this.repository.updateCustomer(userMasterId, dto);
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers(listingParams: CustomerListingParams) {
    try {
      return await this.repository.getAllCustomers(listingParams);
    } catch (error) {
      throw error;
    }
  }

  async getVendorsByLocation(userMasterId: number, dto: VendorLocationDto) {
    try {
      return await this.repository.getVendorsByLocation(userMasterId, dto);
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(userMasterId: number) {
    try {
      return await this.repository.getVendorById(userMasterId);
    } catch (error) {
      throw error;
    }
  }

  async getVendorServicesByVendorId(
    vendorId: number,
    // dto: VendorServiceParams,
  ) {
    try {
      return await this.repository.getVendorServicesByVendorId(vendorId);
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(id: number) {
    try {
      return await this.repository.deleteCustomer(id);
    } catch (error) {
      throw error;
    }
  }
}
