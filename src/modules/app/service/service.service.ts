import { Injectable, BadRequestException } from '@nestjs/common';
import { ServiceRepository } from './service.repository';
import { ServiceCreateDto, ServiceUpdateDto } from './dto';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';

@Injectable()
export class ServiceService {
  constructor(private repository: ServiceRepository) {}

  async createService(data: ServiceCreateDto) {
    try {
      return await this.repository.createService(data);
    } catch (error) {
      throw error;
    }
  }

  async updateService(id: number, data: ServiceUpdateDto) {
    try {
      return await this.repository.updateService(id, data);
    } catch (error) {
      throw error;
    }
  }

  async getService(id: number) {
    try {
      return await this.repository.getService(id);
    } catch (error) {
      throw error;
    }
  }

  // async getAllService(page: number, take: number, search?: string) {
  //   try {
  //     return await this.repository.getAllService(page, take, search);
  //   } catch (error) {}
  // }

  async getAllService(listingParams: ServiceCategorySubCategoryListingParams) {
    try {
      return await this.repository.getAllService(listingParams);
    } catch (error) {}
  }

  async deleteService(id: number) {
    try {
      return await this.repository.deleteService(id);
    } catch (error) {
      throw error;
    }
  }
}
