import { Injectable, BadRequestException } from '@nestjs/common';
import { VendorRepository } from './vendor.repository';
import { VendorCreateServiceDto, VendorUpdateStatusDto } from './dto';
import { successResponse } from 'src/helpers/response.helper';

@Injectable()
export class VendorService {
  constructor(private repository: VendorRepository) {}

  async createVendorService(dto: VendorCreateServiceDto, userMasterId: number) {
    try {
      const vendorService = await this.repository.createVendorService(
        dto,
        userMasterId,
      );
      if (!vendorService) {
        throw new BadRequestException('Unable to create this vendor service');
      }
      return successResponse(201, 'Vendor service successfully created.');
    } catch (error) {
      throw error;
    }
  }

  async approveVendor(id: number, dto: VendorUpdateStatusDto) {
    try {
      return await this.repository.approveVendor(id, dto);
    } catch (error) {
      throw error;
    }
  }

  async getVendorService(id: number) {
    try {
      return await this.repository.getCategory(id);
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id: number, data: VendorUpdateStatusDto) {
    try {
      return await this.repository.updateCategory(id, data);
    } catch (error) {
      throw error;
    }
  }

  async getAllVendorServices(page: number, take: number, search?: string) {
    try {
      return await this.repository.getAllCategory(page, take, search);
    } catch (error) {}
  }

  async deleteVendorService(id: number) {
    try {
      return await this.repository.deleteVendorService(id);
    } catch (error) {
      throw error;
    }
  }
}
