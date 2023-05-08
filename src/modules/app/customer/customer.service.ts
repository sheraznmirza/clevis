import { Injectable } from '@nestjs/common';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import { CustomerListingParams } from 'src/core/dto';
import { CustomerRepository } from './customer.repository';

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

  async getAllCustomers(listingParams: CustomerListingParams) {
    try {
      return await this.repository.getAllCustomers(listingParams);
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
