import { Injectable, BadRequestException } from '@nestjs/common';
import { VendorRepository } from './vendor.repository';
import { VendorCreateServiceDto, VendorUpdateStatusDto } from './dto';
import { successResponse } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import { Vendor } from '@prisma/client';
import {
  ListingParams,
  RiderVendorTabs,
  VendorListingParams,
  VendorRiderByIdParams,
} from 'src/core/dto';

@Injectable()
export class VendorService {
  constructor(
    private repository: VendorRepository,
    private mail: MailService,
  ) {}

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
      const vendor: Vendor = await this.repository.approveVendor(id, dto);
      await this.mail.sendVendorRiderApprovalEmail(vendor);
      return successResponse(
        200,
        `Vendor successfully ${vendor.status.toLowerCase()}.`,
      );
    } catch (error) {
      throw error;
    }
  }

  async getVendorAllService(id: number, listingParams: ListingParams) {
    try {
      return await this.repository.getAllVendorService(id, listingParams);
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(id: number, query?: VendorRiderByIdParams) {
    try {
      switch (query.tabName) {
        case RiderVendorTabs.PROFILE:
          return await this.repository.getVendorByIdProfile(id);
        case RiderVendorTabs.COMPANY_PROFILE:
          return await this.repository.getVendorByIdCompany(id);
        case RiderVendorTabs.ACCOUNT_DETAILS:
          return await this.repository.getVendorByIdAccount(id);
        case RiderVendorTabs.COMPANY_SCHEDULE:
          return await this.repository.getVendorByIdSchedule(id);
        default:
          return await this.repository.getVendorById(id);
      }
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

  // async getAllVendorServices(page: number, take: number, search?: string) {
  //   try {
  //     return await this.repository.getAllCategory(page, take, search);
  //   } catch (error) {}
  // }

  async getAllVendors(listingParams: VendorListingParams) {
    try {
      return await this.repository.getAllVendors(listingParams);
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
  }

  async deleteVendor(id: number) {
    try {
      return await this.repository.deleteVendor(id);
    } catch (error) {
      throw error;
    }
  }

  async deleteVendorService(id: number) {
    try {
      return await this.repository.deleteVendorService(id);
    } catch (error) {
      throw error;
    }
  }
}
