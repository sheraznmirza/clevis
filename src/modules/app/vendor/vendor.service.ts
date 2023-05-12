import { Injectable, BadRequestException } from '@nestjs/common';
import { VendorRepository } from './vendor.repository';
import {
  UpdateVendorDto,
  VendorCreateServiceDto,
  VendorUpdateStatusDto,
} from './dto';
import { successResponse } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import { Status, Vendor } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
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
    private config: ConfigService,
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
      const vendor: any = await this.repository.approveVendor(id, dto);
      // await this.mail.sendVendorRiderApprovalEmail(vendor);   umair

      const context = {
        app_name: this.config.get('APP_NAME'),
        app_url: `${this.config.get('APP_URL')}`,
        first_name: vendor.fullName,
        message:
          vendor.status === Status.APPROVED
            ? 'Your account has been approved. You can now log in and start your journey with us!'
            : 'Your account has been rejected. Please contact our support for further information.',
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };
      await this.mail.sendEmail(
        vendor.companyEmail,
        this.config.get('MAIL_FROM'),
        `${this.config.get('APP_NAME')} - ${
          vendor.userType[0] + vendor.userType.slice(1).toLowerCase()
        } ${vendor.status.toLowerCase()}`,
        'vendorApprovedRejected',
        context, // `.hbs` extension is appended automatically
      );

      return successResponse(
        200,
        `Vendor successfully ${vendor.status.toLowerCase()}.`,
      );
    } catch (error) {
      throw error;
    }
  }

  async updateVendor(userMasterId: number, dto: UpdateVendorDto) {
    try {
      return await this.repository.updateVendor(userMasterId, dto);
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
      if (query) {
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
      } else {
        return await this.repository.getVendorById(id);
      }
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
