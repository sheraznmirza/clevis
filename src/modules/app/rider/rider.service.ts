import { Injectable } from '@nestjs/common';
import { RiderRepository } from './rider.repository';
import { RiderUpdateDto, RiderUpdateStatusDto } from './dto';
import { successResponse } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import { Rider } from '@prisma/client';
import {
  RiderListingParams,
  RiderVendorTabs,
  VendorRiderByIdParams,
} from 'src/core/dto';

@Injectable()
export class RiderService {
  constructor(private repository: RiderRepository, private mail: MailService) {}

  async approveRider(id: number, dto: RiderUpdateStatusDto) {
    try {
      const rider: Rider = await this.repository.approveRider(id, dto);
      await this.mail.sendVendorRiderApprovalEmail(rider);
      return successResponse(
        200,
        `Vendor successfully ${rider.status.toLowerCase()}.`,
      );
    } catch (error) {
      throw error;
    }
  }

  async getRiderById(id: number, query?: VendorRiderByIdParams) {
    try {
      if (query) {
        switch (query.tabName) {
          case RiderVendorTabs.PROFILE:
            return await this.repository.getRiderByIdProfile(id);
          case RiderVendorTabs.COMPANY_PROFILE:
            return await this.repository.getRiderByIdCompany(id);
          case RiderVendorTabs.ACCOUNT_DETAILS:
            return await this.repository.getRiderByIdAccount(id);
          case RiderVendorTabs.COMPANY_SCHEDULE:
            return await this.repository.getRiderByIdSchedule(id);
          default:
            return await this.repository.getRiderById(id);
        }
      } else {
        return await this.repository.getRiderById(id);
      }
    } catch (error) {
      throw error;
    }
  }

  async updateRider(userMasterId: number, dto: RiderUpdateDto) {
    try {
      return await this.repository.updateRider(userMasterId, dto);
    } catch (error) {
      throw error;
    }
  }

  async deleteRider(id: number) {
    try {
      return await this.repository.deleteRider(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllRiders(listingParams: RiderListingParams) {
    try {
      return await this.repository.getAllRiders(listingParams);
    } catch (error) {
      throw error;
    }
  }
}
