import { Injectable } from '@nestjs/common';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import {
  CustomerListingParams,
  CustomerVendorListingParams,
  ListingParams,
} from '../../../core/dto';
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

  async getVendorsByLocation(dto: VendorLocationDto) {
    try {
      return await this.repository.getVendorsByLocation(dto);
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
