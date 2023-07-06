import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RiderUpdateDto,
  RiderUpdateStatusDto,
  UpdateRequestDto,
  UpdateRiderScheduleDto,
} from './dto';
import {
  EntityType,
  Media,
  NotificationType,
  ServiceType,
  UserType,
  Vendor,
} from '@prisma/client';
import { RiderListingParams, VendorListingParams } from 'src/core/dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationData } from 'src/modules/notification-socket/types';
import { NotificationBody, NotificationTitle } from 'src/constants';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { MailService } from 'src/modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';

@Injectable()
export class RiderRepository {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private mail: MailService,
    private config: ConfigService,
  ) {
    // this.config = new ConfigService();
  }

  async approveRider(id: number, dto: RiderUpdateStatusDto) {
    try {
      const rider = await this.prisma.rider.update({
        where: {
          riderId: id,
        },
        data: {
          status: dto.status,
        },
      });
      return rider;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException(
          'The rider with this vendorId does not exist',
        );
      } else {
        throw error;
      }
    }
  }

  async getRiderByIdProfile(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          profilePicture: {
            select: {
              key: true,
              location: true,
              name: true,
              id: true,
            },
          },
          rider: {
            select: {
              riderId: true,
              fullName: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getRiderByIdAccount(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          rider: {
            select: {
              riderId: true,
              banking: {
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getRiderByIdCompany(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          isEmailVerified: true,
          phone: true,
          rider: {
            select: {
              riderId: true,
              fullName: true,
              description: true,
              companyEmail: true,
              companyName: true,
              businessLicense: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              userAddress: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getRiderByIdSchedule(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          rider: {
            select: {
              riderId: true,
              alwaysOpen: true,
              companySchedule: {
                orderBy: {
                  id: 'asc',
                },
                select: {
                  id: true,
                  day: true,
                  startTime: true,
                  endTime: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getRiderById(id: number) {
    try {
      const riderget = await this.prisma.userMaster.findFirst({
        where: {
          userMasterId: id,
          userType: UserType.RIDER,
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          isActive: true,
          profilePicture: {
            select: {
              key: true,
              location: true,
              name: true,
              id: true,
            },
          },
          rider: {
            select: {
              riderId: true,
              businessLicense: {
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              fullName: true,
              companyName: true,
              userAddress: {
                take: 1,
                where: {
                  isDeleted: false,
                  isActive: true,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  isActive: true,
                  isDeleted: true,
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
              banking: {
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                },
              },
            },
          },
        },
      });
      if (riderget == null) {
        throw unknowError(417, { status: 404 }, 'Rider does not exist');
      } else {
        return riderget;
      }
    } catch (error) {
      throw unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async requestUpdate(dto: UpdateRequestDto, riderId: number) {
    try {
      const businesess = [];

      if (dto.businessLicense) {
        dto.businessLicense.forEach(async (business) => {
          const result = await this.prisma.media.create({
            data: business,
            select: {
              id: true,
            },
          });
          businesess.push(result.id.toString());
        });
      }

      const businessLicenseIds = businesess.join(',');

      await this.prisma.updateApproval.create({
        data: {
          companyEmail:
            dto.companyEmail !== null ? dto.companyEmail : undefined,
          companyName: dto.companyName !== null ? dto.companyName : undefined,
          riderId,
          ...(businessLicenseIds && {
            businessLicenseIds: businessLicenseIds,
          }),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Update request is already created');
      }
      throw error;
    }
  }

  async getAllRiders(listingParams: RiderListingParams) {
    const { page = 1, take = 10, search, status } = listingParams;
    try {
      const riders = await this.prisma.userMaster.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          isDeleted: false,
          isEmailVerified: true,
          userType: UserType.RIDER,
          rider: {
            ...(search && {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
              ],
            }),
            status: {
              equals: status !== null ? status : undefined,
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          isActive: true,
          rider: {
            select: {
              riderId: true,
              businessLicense: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              fullName: true,
              companyName: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
            },
          },
        },
      });

      const totalCount = await this.prisma.userMaster.count({
        where: {
          isEmailVerified: true,
          isDeleted: false,
          userType: UserType.RIDER,
          rider: {
            status:
              listingParams.status !== null ? listingParams.status : undefined,
          },
        },
      });

      return {
        data: riders,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
  }

  async updateRiderSchedule(riderId: number, dto: UpdateRiderScheduleDto) {
    try {
      dto.companySchedule.forEach(async (element) => {
        await this.prisma.companySchedule.update({
          where: {
            id: element.id,
          },
          data: {
            startTime: element.startTime,
            endTime: element.endTime,
            isActive: element.isActive,
          },
        });
      });

      if (typeof dto.alwaysOpen === 'boolean') {
        await this.prisma.rider.update({
          where: {
            riderId: riderId,
          },
          data: {
            alwaysOpen: dto.alwaysOpen,
          },
        });
      }

      const scheduleArray = await this.prisma.companySchedule.findMany({
        where: {
          riderId: riderId,
        },
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          isActive: true,
        },
      });
      return {
        ...successResponse(200, 'Schedule updated successfully!'),
        data: scheduleArray,
        alwaysOpen: dto.alwaysOpen,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateRider(userMasterId: number, dto: RiderUpdateDto) {
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId,
        },
        select: {
          email: true,
          rider: {
            select: {
              fullName: true,
              riderId: true,
            },
          },
        },
      });

      if (!user) throw new ForbiddenException('User does not exist');

      let profilePicture: Media;
      let logo: Media;

      if (dto.profilePicture) {
        profilePicture = await this.prisma.media.create({
          data: {
            name: dto.profilePicture.name,
            key: dto.profilePicture.key,
            location: dto.profilePicture.location,
          },
        });
      }

      if (dto.logo) {
        logo = await this.prisma.media.create({
          data: {
            name: dto.logo.name,
            key: dto.logo.key,
            location: dto.logo.location,
          },
        });
      }

      const businesess = [];
      const workspaces = [];
      if (dto.businessLicense) {
        dto.businessLicense.forEach(async (business) => {
          const result = await this.prisma.media.create({
            data: business,
            select: {
              id: true,
            },
          });
          businesess.push(result);
        });
      }

      if (dto.workspaceImages) {
        dto.workspaceImages.forEach(async (business) => {
          const result = await this.prisma.media.create({
            data: business,
            select: {
              id: true,
            },
          });
          workspaces.push(result);
        });
      }

      if (dto.accountNumber && dto.accountTitle && dto.bankName) {
        await this.prisma.banking.updateMany({
          where: {
            riderId: user.rider.riderId,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      if (
        (dto.fullAddress ||
          dto.cityId ||
          typeof dto.longitude === 'number' ||
          typeof dto.latitude === 'number') &&
        !(
          dto.fullAddress &&
          dto.cityId &&
          typeof dto.longitude === 'number' &&
          typeof dto.latitude === 'number'
        )
      ) {
        throw new BadRequestException(
          "Please provide every parameter in the address (fullAddress, cityId, lat, long) to update the user's address",
        );
      }

      if (dto.userAddressId) {
        await this.prisma.userAddress.update({
          where: {
            userAddressId: dto.userAddressId,
          },
          data: {
            isDeleted: true,
            isActive: false,
          },
        });
      }

      const rider = await this.prisma.userMaster.update({
        where: {
          userMasterId: userMasterId,
        },
        data: {
          phone: dto.phone !== null ? dto.phone : undefined,
          profilePictureId: profilePicture ? profilePicture.id : undefined,
          isActive: dto.isActive !== null ? dto.isActive : undefined,
          rider: {
            update: {
              fullName: dto.fullName !== null ? dto.fullName : undefined,
              companyEmail:
                dto.companyEmail !== null ? dto.companyEmail : undefined,
              description:
                dto.description !== null ? dto.description : undefined,
              logoId: logo ? logo.id : undefined,

              ...(dto.accountNumber &&
                dto.accountTitle &&
                dto.bankName && {
                  banking: {
                    create: {
                      accountTitle:
                        dto.accountTitle !== null
                          ? dto.accountTitle
                          : undefined,
                      accountNumber:
                        dto.accountNumber !== null
                          ? dto.accountNumber
                          : undefined,
                      bankName:
                        dto.bankName !== null ? dto.bankName : undefined,
                    },
                  },
                }),

              ...(dto.fullAddress &&
                dto.cityId &&
                dto.longitude &&
                dto.latitude && {
                  userAddress: {
                    create: {
                      fullAddress: dto.fullAddress,
                      cityId: dto.cityId,
                      latitude: dto.latitude,
                      longitude: dto.longitude,
                    },
                  },
                }),
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          profilePicture: {
            select: {
              key: true,
              location: true,
              name: true,
              id: true,
            },
          },
          rider: {
            select: {
              riderId: true,
              businessLicense: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                where: {
                  media: {
                    isDeleted: false,
                  },
                },
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              fullName: true,
              companyName: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
              banking: {
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                },
              },
            },
          },
        },
      });
      if (businesess.length > 0) {
        await this.prisma.businessLicense.createMany({
          data: businesess.map((item) => ({
            riderRiderId: rider.rider.riderId,
            mediaId: item.id,
          })),
        });
      }

      if (workspaces.length > 0) {
        await this.prisma.workspaceImages.createMany({
          data: workspaces.map((item) => ({
            riderRiderId: rider.rider.riderId,
            mediaId: item.id,
          })),
        });
      }

      const payload: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.UpdateByAdmin,
        userId: [rider.userMasterId],
        data: {
          title: NotificationTitle.VENDOR_UPDATE_BY_ADMIN,
          body: NotificationBody.VENDOR_UPDATE_BY_ADMIN,
          type: NotificationType.UpdateByAdmin,
          entityType: EntityType.RIDER,
          entityId: rider.rider.riderId,
        },
      };
      await this.notificationService.HandleNotifications(
        payload,
        UserType.RIDER,
      );

      if (Boolean(dto?.isActive) === true || Boolean(dto?.isActive) === false) {
        const status = dto.isActive
          ? 'Account Activated'
          : 'Account Deactivated';

        const context = {
          name: rider.rider.fullName,
          message: dto.isActive
            ? `<p>Your account has been activated , you can now login using your registered email and password</p><p>If you have any question , please contact admin.</p>`
            : `<p> Unfortunately your account has been deactivated</p> <p>If you have any question, please contact admin for further assistance regarding this issue.</p>`,
          app_name: this.config.get('APP_NAME'),
          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        };

        this.mail.sendEmail(
          user.email,
          this.config.get('MAIL_NO_REPLY'),
          status,
          'inactive',
          context,
        );
      }
      return {
        ...successResponse(200, 'Rider updated successfully.'),
        ...rider,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteRider(id: number) {
    try {
      await this.prisma.userMaster.update({
        where: {
          userMasterId: id,
        },
        data: {
          isDeleted: true,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  //   async createLaundryVendorService(
  //     dto: VendorCreateServiceDto,
  //     vendor: Vendor,
  //   ) {
  //     return await this.prisma.vendorService.create({
  //       data: {},
  //     });
  //   }
}
