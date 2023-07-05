import { Injectable, BadRequestException } from '@nestjs/common';
import { VendorRepository } from './vendor.repository';
import {
  UpdateRequestDto,
  CreateAndUpdateDeliverySchedule,
  UpdateVendorDto,
  UpdateVendorScheduleDto,
  VendorCreateServiceDto,
  VendorUpdateBusyStatusDto,
  VendorUpdateServiceDto,
  VendorUpdateStatusDto,
  GetRiderListing,
} from './dto';
import { successResponse, unknowError } from '../../../helpers/response.helper';
import { MailService } from '../../mail/mail.service';
import {
  EntityType,
  NotificationType,
  ServiceType,
  Status,
  UserType,
  Vendor,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import {
  GetUserType,
  ListingParams,
  RiderVendorTabs,
  VendorListingParams,
  VendorRiderByIdParams,
  VendorServiceListingParams,
} from 'src/core/dto';
import { dynamicUrl } from 'src/helpers/dynamic-url.helper';
import {
  convertDateTimeToTimeString,
  setAlwaysOpen,
} from 'src/helpers/alwaysOpen.helper';
import dayjs from 'dayjs';
import { SocketGateway } from 'src/modules/notification-socket/socket.gateway';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import {
  createBusinessRequestInterface,
  createMerchantRequestInterface,
} from 'src/modules/tap/dto/card.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { TapService } from 'src/modules/tap/tap.service';
import { NotificationData } from 'src/modules/notification-socket/types';
import { NotificationBody, NotificationTitle } from 'src/constants';
import { BullQueueService } from 'src/modules/queue/bull-queue.service';

@Injectable()
export class VendorService {
  constructor(
    private repository: VendorRepository,
    private mail: MailService,
    private config: ConfigService,
    private prisma: PrismaService,
    private tapService: TapService,
    private notificationService: NotificationService,
    private queue: BullQueueService,
  ) {}

  async createVendorService(dto: VendorCreateServiceDto, user: GetUserType) {
    try {
      if (
        user.serviceType === ServiceType.CAR_WASH &&
        dto.allocatePrice.some((obj) =>
          // [undefined, null].includes(obj?.subcategoryId),
          obj.hasOwnProperty('subcategoryId'),
        )
      ) {
        throw new BadRequestException(
          'Subcategory is Not Allowed for Car Wash Booking',
        );
      }

      const vendorService = await this.repository.createVendorService(
        dto,
        user.userMasterId,
      );
      if (!vendorService) {
        throw new BadRequestException('Unable to create this vendor service');
      }
      return successResponse(201, 'Vendor service successfully created.');
    } catch (error) {
      throw error;
    }
  }

  async requestUpdate(dto: UpdateRequestDto, vendorId: number) {
    try {
      return await this.repository.requestUpdate(dto, vendorId);
    } catch (error) {
      throw error;
    }
  }

  async updateVendorService(
    dto: VendorUpdateServiceDto,
    userMasterId: number,
    vendorServiceId: number,
  ) {
    try {
      // throw new BadRequestException('Invalid data');
      const vendorService = await this.repository.updateVendorService(
        dto,
        userMasterId,
        vendorServiceId,
      );
      if (!vendorService) {
        throw new BadRequestException('Unable to create this vendor service');
      }
      return successResponse(201, 'Vendor service successfully updated.');
    } catch (error) {
      throw error;
    }
  }

  async approveVendor(id: number, dto: VendorUpdateStatusDto) {
    try {
      const user = await this.repository.approveVendor(id, dto);

      this.queue.createBusinessAndMerchantForVendorRider(
        user,
        dto,
        UserType.VENDOR,
      );
      return successResponse(
        200,
        `Vendor successfully ${dto.status.toLowerCase()}.`,
      );
    } catch (error) {
      throw error;
    }
  }

  async updateBusyStatusVendor(
    vendorId: number,
    dto: VendorUpdateBusyStatusDto,
  ) {
    try {
      return await this.repository.updateBusyStatusVendor(vendorId, dto);
    } catch (error) {
      throw error;
    }
  }

  async updateVendor(
    userMasterId: number,
    dto: UpdateVendorDto,
    userType: UserType,
  ) {
    try {
      return await this.repository.updateVendor(userMasterId, dto, userType);
    } catch (error) {
      throw error;
    }
  }

  async updateVendorSchedule(vendorId: number, dto: UpdateVendorScheduleDto) {
    try {
      if (dto.alwaysOpen) {
        dto.companySchedule = setAlwaysOpen(dto.companySchedule);
        return await this.repository.updateVendorSchedule(vendorId, dto);
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
      return await this.repository.updateVendorSchedule(vendorId, dto);
    } catch (error) {
      throw error;
    }
  }

  async getVendorServiceById(vendorServiceId: number) {
    try {
      return await this.repository.getVendorServiceById(vendorServiceId);
    } catch (error) {
      throw error;
    }
  }

  async getVendorServices(vendorId: number) {
    try {
      return await this.repository.getVendorServices(vendorId);
    } catch (error) {
      throw error;
    }
  }

  // async getDashboard(user: GetUserType) {
  //   try {
  //     return await this.repository.getDashboard(user);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getVendorAllService(
    id: number,
    listingParams: VendorServiceListingParams,
  ) {
    try {
      return await this.repository.getAllVendorService(id, listingParams);
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(
    id: number,
    query?: VendorRiderByIdParams,
    vendorId?: number,
  ) {
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
          case RiderVendorTabs.DELIVERY_SCHEDULE:
            return await this.repository.getDeliverySchedule(vendorId);
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

  async getRiderDirectory(user: GetUserType, listingParams: GetRiderListing) {
    try {
      return await this.repository.getRiderDirectory(user, listingParams);
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

  async createDeliverySchedule(
    dto: CreateAndUpdateDeliverySchedule,
    vendorId: number,
  ) {
    try {
      const deliverySchedule = await this.repository.createDeliverySchedule(
        dto,
        vendorId,
      );
      if (!deliverySchedule) {
        throw new BadRequestException('Unable to create this vendor service');
      }
      return successResponse(201, 'Delivery Schedule successfully created.');
    } catch (error) {
      throw error;
    }
  }

  async deliveryScheduleUpdate(
    vendorId: number,
    dto: CreateAndUpdateDeliverySchedule,
  ) {
    try {
      return await this.repository.deliveryScheduleUpdate(vendorId, dto);
    } catch (error) {
      throw error;
    }
  }

  // async getDeliverySchedule(vendorId: number) {
  //   try {
  //     return await this.repository.getDeliverySchedule(vendorId);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async _createBusinessMerchantForVendor(
    vendor: any,
    dto: VendorUpdateStatusDto,
  ) {
    try {
      console.log('vendor queue initiated');
      const user = await this.prisma.userMaster.findFirst({
        where: { vendor: { vendorId: vendor.vendorId } },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          vendor: {
            select: {
              userMasterId: true,
              status: true,
              userAddress: {
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
              vendorId: true,
              companyEmail: true,
              companyName: true,
              logo: true,
              description: true,
              serviceType: true,
            },
          },
        },
      });
      const payload: createBusinessRequestInterface = {
        name: {
          en: user.vendor.companyName,
        },
        type: 'corp',
        entity: {
          legal_name: {
            en: user.vendor.companyName,
          },
          is_licensed: false,
          country: user.vendor.userAddress[0].city.State.country.shortName,
          billing_address: {
            recipient_name: user.vendor.fullName,
            address_1: user.vendor.userAddress[0].fullAddress,
            city: user.vendor.userAddress[0].city.cityName,
            state: user.vendor.userAddress[0].city.State.stateName,
            country: user.vendor.userAddress[0].city.State.country.shortName,
          },
        },
        contact_person: {
          name: {
            first: user.vendor.fullName,
            last: 'Clevis',
          },

          contact_info: {
            primary: {
              email: user.email,
              phone: {
                country_code:
                  user.vendor.userAddress[0].city.State.country.countryCode,
                number: user.phone.replace('+', ''),
              },
            },
          },
          authorization: {
            name: {
              first: user.vendor.fullName,
              last: 'Clevis',
            },
          },
        },
        brands: [
          {
            name: {
              en: user.vendor.companyName,
            },
          },
        ],
      };
      const tapbusiness = await this.tapService.createBusniess(payload);

      const merchantPayload: createMerchantRequestInterface = {
        display_name: user.vendor.fullName,
        branch_id: tapbusiness.entity.branches[0].id,
        brand_id: tapbusiness.brands[0].id,
        business_entity_id: tapbusiness.entity.id,
        business_id: tapbusiness.id,
      };

      const merchantTap = await this.tapService.createMerchant(merchantPayload);

      await this.prisma.vendor.update({
        where: {
          vendorId: user.vendor.vendorId,
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

      const context = {
        app_name: this.config.get('APP_NAME'),
        app_url: `${this.config.get(dynamicUrl(user.userType))}`,
        first_name: user.vendor.fullName,
        message:
          user.vendor.status === Status.APPROVED
            ? 'Great news! Your Vendor account has been approved.\n We are happy to have you on board. To start , add in services and set up profile to get bookings.\n If you have any question , please contact admin. \n For Payments, goto Tap.Company and use this Email to login after recovering password from forgot password.   '
            : 'We regret to inform you that your Vendor account application has been rejected. We appreciate your interest and encourage you to reapply if you meet the requirements.\n Please contact admin if you have any questions regarding this issue ',
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };
      await this.mail.sendEmail(
        user.email,
        this.config.get('MAIL_NO_REPLY'),
        `${
          user.userType[0] + user.userType.slice(1).toLowerCase()
        } ${user.vendor.status.toLowerCase()}`,
        'vendorApprovedRejected',
        context, // `.hbs` extension is appended automatically
      );

      const payloads: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.VendorStatus,
        userId: [user.vendor.userMasterId],
        data: {
          title:
            dto.status === 'APPROVED'
              ? NotificationTitle.ADMIN_APPROVED
              : NotificationTitle.ADMIN_REJECTED,
          body:
            dto.status === 'APPROVED'
              ? NotificationBody.ADMIN_APPROVED
              : NotificationBody.ADMIN_REJECTED,
          type: NotificationType.BookingStatus,
          entityType: EntityType.VENDOR,
          entityId: user.vendor.vendorId,
        },
      };
      await this.notificationService.HandleNotifications(
        payloads,
        UserType.VENDOR,
      );
    } catch (error) {}
  }
}
