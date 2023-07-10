import { Injectable, BadRequestException } from '@nestjs/common';
import { RiderRepository } from './rider.repository';
import {
  RiderUpdateDto,
  RiderUpdateStatusDto,
  UpdateRequestDto,
  UpdateRiderScheduleDto,
} from './dto';
import { successResponse, unknowError } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import {
  RiderListingParams,
  RiderVendorTabs,
  VendorRiderByIdParams,
} from 'src/core/dto';
import {
  EntityType,
  NotificationType,
  Rider,
  Status,
  UserType,
} from '@prisma/client';
import { VendorListingParams } from 'src/core/dto';
import { ConfigService } from '@nestjs/config';
import { dynamicUrl } from 'src/helpers/dynamic-url.helper';
import {
  convertDateTimeToTimeString,
  setAlwaysOpen,
} from 'src/helpers/alwaysOpen.helper';
import dayjs from 'dayjs';
import { ERROR_MESSAGE } from 'src/core/constants';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  createBusinessRequestInterface,
  createMerchantRequestInterface,
} from 'src/modules/tap/dto/card.dto';
import { TapService } from 'src/modules/tap/tap.service';
import { BullQueueService } from 'src/modules/queue/bull-queue.service';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationData } from 'src/modules/notification-socket/types';
import { NotificationBody, NotificationTitle } from 'src/constants';

@Injectable()
export class RiderService {
  constructor(
    private repository: RiderRepository,
    private mail: MailService,
    private config: ConfigService,
    private prisma: PrismaService,
    private tapService: TapService,
    private notificationService: NotificationService,
    private queue: BullQueueService,
  ) {}

  async approveRider(id: number, dto: RiderUpdateStatusDto) {
    try {
      const user = await this.repository.approveRider(id, dto);
      this.queue.createBusinessAndMerchantForRider(user, dto, UserType.RIDER);

      return successResponse(
        200,
        `Rider successfully ${dto.status.toLowerCase()}.`,
      );
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
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

  async _createBusinessMerchantForRider(rider: any, dto: RiderUpdateStatusDto) {
    try {
      const user = await this.prisma.userMaster.findFirst({
        where: {
          rider: {
            riderId: rider.riderId,
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          rider: {
            select: {
              userMaster: {
                select: { email: true },
              },
              userMasterId: true,
              status: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  cityId: true,
                  longitude: true,
                  latitude: true,
                  city: {
                    select: {
                      cityName: true,
                      State: {
                        select: {
                          stateName: true,
                          country: {
                            select: {
                              countryCode: true,
                              countryName: true,
                              currency: true,
                              shortName: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              fullName: true,
              riderId: true,
              companyEmail: true,
              companyName: true,
              logo: true,
              description: true,
            },
          },
        },
      });
      if (user.rider.status === Status.APPROVED) {
        const payload: createBusinessRequestInterface = {
          name: {
            en: user.rider.companyName,
          },
          type: 'corp',
          entity: {
            legal_name: {
              en: user.rider.companyName,
            },
            is_licensed: false,
            country: user.rider.userAddress[0].city.State.country.shortName,
            billing_address: {
              recipient_name: user.rider.fullName,
              address_1: user.rider.userAddress[0].fullAddress,
              city: user.rider.userAddress[0].city.cityName,
              state: user.rider.userAddress[0].city.State.stateName,
              country: user.rider.userAddress[0].city.State.country.shortName,
            },
          },
          contact_person: {
            name: {
              first: user.rider.fullName,
              last: 'Clevis',
            },

            contact_info: {
              primary: {
                email: user.email,
                phone: {
                  country_code:
                    user.rider.userAddress[0].city.State.country.countryCode,
                  number: user.phone.replace('+', ''),
                },
              },
            },
            authorization: {
              name: {
                first: user.rider.fullName,
                last: 'Clevis',
              },
            },
          },
          brands: [
            {
              name: {
                en: user.rider.companyName,
              },
            },
          ],
        };
        const tapbusiness = await this.tapService.createBusniess(payload);

        const merchantPayload: createMerchantRequestInterface = {
          display_name: user.rider.fullName,
          branch_id: tapbusiness.entity.branches[0].id,
          brand_id: tapbusiness.brands[0].id,
          business_entity_id: tapbusiness.entity.id,
          business_id: tapbusiness.id,
        };

        const merchantTap = await this.tapService.createMerchant(
          merchantPayload,
        );
        await this.prisma.rider.update({
          where: {
            riderId: user.rider.riderId,
          },
          data: {
            tapBusinessId: tapbusiness.id,
            tapBranchId: tapbusiness.entity.branches[0].id,
            tapBrandId: tapbusiness.brands[0].id,
            tapPrimaryWalletId: tapbusiness.entity.wallets[0].id,
            tapBusinessEntityId: tapbusiness.entity.id,
            tapMerchantId: merchantTap.id,
            tapWalletId: merchantTap.wallets.id,
          },
        });
      }
      const context = {
        app_name: this.config.get('APP_NAME'),
        first_name: user.rider.fullName,
        message:
          rider.status === Status.APPROVED
            ? 'Your account has been approved. You can now log in and start your journey with us!'
            : 'Your account has been rejected. Please contact our support for further information.',
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };
      const status =
        dto.status === Status.APPROVED
          ? 'Account Approved'
          : dto.status === Status.REJECTED
          ? 'Application Rejected'
          : '';
      await this.mail.sendEmail(
        user.rider.userMaster.email,
        this.config.get('MAIL_ADMIN'),
        status,
        'vendorApprovedRejected',
        context, // `.hbs` extension is appended automatically
      );

      // const payloads: SQSSendNotificationArgs<NotificationData> = {
      //   type: NotificationType.VendorStatus,
      //   userId: [user.rider.userMasterId],
      //   data: {
      //     title:
      //       dto.status === 'APPROVED'
      //         ? NotificationTitle.ADMIN_APPROVED
      //         : NotificationTitle.ADMIN_REJECTED,
      //     body:
      //       dto.status === 'APPROVED'
      //         ? NotificationBody.ADMIN_APPROVED_RIDER.replace(
      //             '{rider}',
      //             user.rider.fullName,
      //           )
      //         : NotificationBody.ADMIN_REJECTED,
      //     type: NotificationType.BookingStatus,
      //     entityType: EntityType.RIDER,
      //     entityId: user.rider.riderId,
      //   },
      // };
      // await this.notificationService.HandleNotifications(
      //   payloads,
      //   UserType.RIDER,
      // );
    } catch (error) {
      await this.prisma.rider.update({
        where: {
          riderId: rider.riderId,
        },
        data: {
          status: Status.REJECTED,
        },
      });
      if (error.response.data) {
        const context = {
          app_name: this.config.get('APP_NAME'),
          first_name: rider.fullName,
          message: `Your account has been rejected due to the following reason: ${error.response.data.errors[0].description}. Please contact our support for further information.`,
          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        };
        await this.mail.sendEmail(
          rider.userMaster.email,
          this.config.get('MAIL_NO_REPLY'),
          `${
            rider.userMaster.userType[0] +
            rider.userMaster.userType.slice(1).toLowerCase()
          } ${Status.REJECTED.toLowerCase()}`,
          'vendorApprovedRejected',
          context, // `.hbs` extension is appended automatically
        );

        const context2 = {
          app_name: this.config.get('APP_NAME'),
          first_name: '',
          message: `The account of ${rider.fullName} has been rejected due to the following reason: ${error.response.data.errors[0].description}. Please contact our support for further information.`,
          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        };
        await this.mail.sendEmail(
          this.config.get('MAIL_ADMIN'),
          this.config.get('MAIL_NO_REPLY'),
          `${
            rider.userMaster.userType[0] +
            rider.userMaster.userType.slice(1).toLowerCase()
          } ${Status.REJECTED.toLowerCase()}`,
          'vendorApprovedRejected',
          context2, // `.hbs` extension is appended automatically
        );
      }
    }
  }
}
