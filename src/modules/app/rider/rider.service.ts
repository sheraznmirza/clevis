import { Injectable, BadRequestException } from '@nestjs/common';
import { RiderRepository } from './rider.repository';
import { RiderUpdateStatusDto } from './dto';
import { successResponse } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import { Rider, Status } from '@prisma/client';
import { VendorListingParams } from 'src/core/dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RiderService {
  constructor(
    private repository: RiderRepository,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  async approveRider(id: number, dto: RiderUpdateStatusDto) {
    try {
      const rider: any = await this.repository.approveRider(id, dto);

      const context = {
        app_name: this.config.get('APP_NAME'),
        app_url: `${this.config.get('APP_URL')}`,
        first_name: rider.fullName,
        message:
          rider.status === Status.APPROVED
            ? 'Your account has been approved. You can now log in and start your journey with us!'
            : 'Your account has been rejected. Please contact our support for further information.',
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };
      await this.mail.sendEmail(
        rider.companyEmail,
        this.config.get('MAIL_FROM'),
        `${this.config.get('APP_NAME')} - ${
          rider.userType[0] + rider.userType.slice(1).toLowerCase()
        } ${rider.status.toLowerCase()}`,
        'vendorApprovedRejected',
        context, // `.hbs` extension is appended automatically
      );

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
