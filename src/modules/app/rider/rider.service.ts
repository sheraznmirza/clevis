import { Injectable, BadRequestException } from '@nestjs/common';
import { RiderRepository } from './rider.repository';
import {
  RiderUpdateDto,
  RiderUpdateStatusDto,
  UpdateRequestDto,
  UpdateRiderScheduleDto,
} from './dto';
import { successResponse } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import {
  RiderListingParams,
  RiderVendorTabs,
  VendorRiderByIdParams,
} from 'src/core/dto';
import { Rider, Status } from '@prisma/client';
import { VendorListingParams } from 'src/core/dto';
import { ConfigService } from '@nestjs/config';
import { dynamicUrl } from 'src/helpers/dynamic-url.helper';
import {
  convertDateTimeToTimeString,
  setAlwaysOpen,
} from 'src/helpers/alwaysOpen.helper';
import dayjs from 'dayjs';

@Injectable()
export class RiderService {
  constructor(
    private repository: RiderRepository,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  async approveRider(id: number, dto: RiderUpdateStatusDto) {
    try {
      const rider = await this.repository.approveRider(id, dto);

      const context = {
        app_name: this.config.get('APP_NAME'),
        app_url: `${this.config.get(dynamicUrl(rider.userType))}`,
        first_name: rider.fullName,
        message:
          rider.status === Status.APPROVED
            ? 'Your account has been approved. You can now log in and start your journey with us!'
            : 'Your account has been rejected. Please contact our support for further information.',
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };
      await this.mail.sendEmail(
        rider.email,
        this.config.get('MAIL_ADMIN'),
        `${this.config.get('APP_NAME')} - ${
          rider.userType[0] + rider.userType.slice(1).toLowerCase()
        } ${rider.status.toLowerCase()}`,
        'vendorApprovedRejected',
        context, // `.hbs` extension is appended automatically
      );

      return successResponse(
        200,
        `Rider successfully ${rider.status.toLowerCase()}.`,
      );
    } catch (error) {
      throw error;
    }
  }

  async requestUpdate(dto: UpdateRequestDto, riderId: number) {
    try {
      return await this.repository.requestUpdate(dto, riderId);
    } catch (error) {
      throw error;
    }
  }

  async updateRiderSchedule(riderId: number, dto: UpdateRiderScheduleDto) {
    try {
      if (dto.alwaysOpen) {
        dto.companySchedule = setAlwaysOpen(dto.companySchedule);
      } else {
        if (dto.companySchedule) {
          const isValid = dto.companySchedule.every((day) => {
            return (
              dayjs(day.endTime).isValid() && dayjs(day.startTime).isValid()
            );
          });

          if (!isValid) {
            throw new BadRequestException(
              'Please provide valid start and end times for the companySchedule.',
            );
          }

          console.log('isValid: ', isValid);
        }
      }
      dto.companySchedule = convertDateTimeToTimeString(dto.companySchedule);
      return await this.repository.updateRiderSchedule(riderId, dto);
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
