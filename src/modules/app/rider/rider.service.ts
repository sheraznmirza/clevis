import { Injectable, BadRequestException } from '@nestjs/common';
import { RiderRepository } from './rider.repository';
import { RiderUpdateStatusDto } from './dto';
import { successResponse } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import { Rider } from '@prisma/client';
import { VendorListingParams } from 'src/core/dto';

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

  async getRiderById(id: number) {
    try {
      return await this.repository.getRiderById(id);
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

  async getAllRiders(listingParams: VendorListingParams) {
    try {
      return await this.repository.getAllRiders(listingParams);
    } catch (error) {
      throw error;
    }
  }
}
