import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import {
  AdminGetBookingsDto,
  BookingDetailsDto,
  CreateBookingCarWashDto,
  CreateBookingDto,
  CustomerGetBookingsDto,
  UpdateBookingStatusParam,
  VendorGetBookingsDto,
} from './dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import {
  BookingStatus,
  EntityType,
  JobType,
  NotificationType,
  RiderJobStatus,
  ServiceType,
  UserAddress,
  UserType,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { mapsDistanceData } from 'src/helpers/maps.helper';
import { ChargeEntityTypes, GetUserType } from 'src/core/dto';
import { TapService } from 'src/modules/tap/tap.service';
import { createChargeRequestInterface } from 'src/modules/tap/dto/card.dto';
import { AuthorizeResponseInterface } from './entity';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationTitle } from 'src/constants';
import { NotificationData } from 'src/modules/notification-socket/types';
import { NotificationBody } from 'src/constants';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class BookingRepository {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private httpService: HttpService,
    private tapService: TapService,
    private notificationService: NotificationService,
    private mail: MailService,
  ) {}

  // async bookingPayment(dto) {
  //   try {

  //   } catch (error) {

  //   }
  // }

  async createBooking(customerId, dto: CreateBookingDto) {
    try {
      let pickupLocationId: UserAddress;
      let dropoffLocationId: UserAddress;
      let dropoffLocation: UserAddress;
      let pickupLocation: UserAddress;
      let pickupResponse: any;
      let dropoffResponse: any;

      const vendor = await this.prisma.vendor.findUnique({
        where: {
          vendorId: dto.vendorId,
        },
        select: {
          isBusy: true,
          userAddress: {
            where: {
              isDeleted: false,
            },
            select: {
              latitude: true,
              longitude: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          deliverySchedule: {
            select: {
              kilometerFare: true,
            },
          },
        },
      });

      if (vendor.isBusy) {
        throw new BadRequestException(
          'Vendor is busy, unable to create booking',
        );
      }

      const attachments = [];
      // console.log('dto.tapAuthId: ', dto.tapAuthId);
      const tapAuthorize = await this.tapService.retrieveAuthorize(
        dto.tapAuthId,
      );
      if (tapAuthorize.status === 'FAILED') {
        throw new BadRequestException('Payment is not authorized.');
      }

      if (dto.attachments && dto.attachments.length > 0) {
        dto.attachments.forEach(async (item) => {
          const result = await this.prisma.media.create({
            data: item,
            select: {
              id: true,
            },
          });
          attachments.push(result);
        });
      }

      if (dto.isWithDelivery) {
        if (dto.pickupLocation && !dto.pickupLocation.userAddressId) {
          pickupLocationId = await this.prisma.userAddress.create({
            data: {
              latitude: dto.pickupLocation.latitude,
              longitude: dto.pickupLocation.longitude,
              cityId: dto.pickupLocation.cityId,
              customerId,
              fullAddress: dto.pickupLocation.fullAddress,
            },
          });
          dto.pickupLocation.userAddressId = pickupLocationId.userAddressId;
        }

        if (dto.dropoffLocation && !dto.dropoffLocation.userAddressId) {
          dropoffLocationId = await this.prisma.userAddress.create({
            data: {
              latitude: dto.dropoffLocation.latitude,
              longitude: dto.dropoffLocation.longitude,
              cityId: dto.dropoffLocation.cityId,
              customerId,
              fullAddress: dto.dropoffLocation.fullAddress,
            },
          });
          dto.dropoffLocation.userAddressId = dropoffLocationId.userAddressId;
        }

        if (dto?.dropoffLocation?.userAddressId) {
          dropoffLocation = await this.prisma.userAddress.findUnique({
            where: {
              userAddressId: dto.dropoffLocation.userAddressId,
            },
          });
        }

        if (dto?.pickupLocation?.userAddressId) {
          pickupLocation = await this.prisma.userAddress.findUnique({
            where: {
              userAddressId: dto.pickupLocation.userAddressId,
            },
          });
        }
      }

      if (pickupLocation && dropoffLocation) {
        pickupResponse = await mapsDistanceData(
          pickupLocation,
          vendor.userAddress[0],
          this.config,
          this.httpService,
        );

        dropoffResponse = await mapsDistanceData(
          dropoffLocation,
          vendor.userAddress[0],
          this.config,
          this.httpService,
        );
      }

      const pickupDeliveryCharges = pickupResponse
        ? pickupResponse?.distanceValue *
          (vendor?.deliverySchedule?.kilometerFare || 8.5)
        : 0;

      const dropoffDeliveryCharges = dropoffResponse
        ? dropoffResponse?.distanceValue *
          (vendor?.deliverySchedule?.kilometerFare || 8.5)
        : 0;

      const bookingDetailPrice: number[] = [];

      for (let i = 0; i < dto.articles.length; i++) {
        const allocatePricePrice = await this.prisma.allocatePrice.findUnique({
          where: {
            id: dto.articles[i].allocatePriceId,
          },
          select: {
            price: true,
          },
        });

        bookingDetailPrice.push(
          dto.articles[i].quantity * allocatePricePrice.price,
        );
      }

      let totalPrice = 0;
      for (let i = 0; i < dto.articles.length; i++) {
        totalPrice += bookingDetailPrice[i];
      }

      const bookingMaster = await this.prisma.bookingMaster.create({
        data: {
          customerId,
          vendorId: dto.vendorId,
          tapAuthId: dto.tapAuthId,
          pickupDeliveryCharges: Math.round(pickupDeliveryCharges),
          dropoffDeliveryCharges: Math.round(dropoffDeliveryCharges),
          bookingDate: dto.bookingDate,
          ...(dto.carNumberPlate && {
            carNumberPlate: dto.carNumberPlate,
          }),
          ...(dto.instructions && { instructions: dto.instructions }),
          totalPrice: totalPrice ? Math.round(totalPrice) : 0,
          ...(dto.isWithDelivery &&
            dto?.pickupLocation?.timeFrom &&
            dto?.pickupLocation?.timeTill && {
              dropffLocationId: dto.dropoffLocation.userAddressId,
              pickupLocationId: dto.pickupLocation.userAddressId,
              pickupTimeFrom: dayjs(dto.pickupLocation.timeFrom).utc().format(),
              pickupTimeTo: dayjs(dto.pickupLocation.timeTill).utc().format(),
              dropoffTimeFrom: dayjs(dto.dropoffLocation.timeFrom)
                .utc()
                .format(),
              dropoffTimeTo: dayjs(dto.dropoffLocation.timeTill).utc().format(),
            }),
          isWithDelivery: dto.isWithDelivery,
        },
        select: {
          bookingMasterId: true,
          bookingDate: true,
          totalPrice: true,
          vendorId: true,
          vendor: {
            select: {
              userMasterId: true,
              fullName: true,
              serviceType: true,
              userMaster: {
                select: {
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              fullName: true,
            },
          },
        },
      });

      await this.prisma.bookingDetail.createMany({
        data: dto.articles.map((bookingDetail, index) => ({
          bookingMasterId: bookingMaster.bookingMasterId,
          allocatePriceId: bookingDetail.allocatePriceId,
          price:
            bookingDetailPrice && bookingDetailPrice.length > 0
              ? bookingDetailPrice[index]
              : 1,
          quantity: bookingDetail.quantity,
        })),
      });

      if (attachments && attachments.length > 0) {
        await this.prisma.bookingAttachments.createMany({
          data: attachments.map((item) => ({
            bookingMasterId: bookingMaster.bookingMasterId,
            mediaId: item.id,
          })),
        });
      }

      // const context = {
      //   first_paragraph:
      //     'You have received a new booking request. Please review the details below and take necessary action:',
      //   vendor_name: bookingMaster.vendor.fullName,
      //   customer_name: bookingMaster.customer.fullName,
      //   booking_id: bookingMaster.bookingMasterId,
      //   service_type: bookingMaster.vendor.serviceType,
      //   booking_date: dayjs(bookingMaster.bookingDate)
      //     .utc()
      //     .format('DD/MM/YYYY'),
      //   booking_time: dayjs(bookingMaster.bookingDate).utc().format('HH:mm'),
      //   total_amount: bookingMaster.totalPrice,
      //   app_name: this.config.get('APP_NAME'),
      //   // app_url: this.config.get(dynamicUrl(user.userType)),
      //   copyright_year: this.config.get('COPYRIGHT_YEAR'),
      //   // otp: randomOtp,
      // };
      // await this.mail.sendEmail(
      //   bookingMaster.vendor.userMaster.email,
      //   this.config.get('MAIL_ADMIN'),
      //   `${this.config.get('APP_NAME')} - New Booking`,
      //   'vendor-accept-booking', // `.hbs` extension is appended automatically
      //   context,
      // );

      const payload: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.BookingCreated,
        userId: [bookingMaster.vendor.userMasterId],
        data: {
          title: NotificationTitle.BOOKING_CREATED,
          body: NotificationBody.BOOKING_CREATED,
          type: NotificationType.BookingCreated,
          entityType: EntityType.BOOKINGMASTER,
          entityId: bookingMaster.bookingMasterId,
        },
      };
      await this.notificationService.HandleNotifications(
        payload,
        UserType.VENDOR,
      );

      return successResponse(201, 'Booking created successfully.');
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Vendor does not exist');
      } else if (error?.code === 'P2002') {
        throw new BadRequestException('tapAuthId already used.');
      }
      throw error;
    }
  }

  async createBookingCarWash(customerId, dto: CreateBookingCarWashDto) {
    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: {
          vendorId: dto.vendorId,
        },
        select: {
          isBusy: true,
        },
      });

      if (vendor.isBusy) {
        throw new BadRequestException(
          'Vendor is busy, unable to create booking',
        );
      }

      const attachments = [];

      const tapAuthorize = await this.tapService.retrieveAuthorize(
        dto.tapAuthId,
      );

      if (tapAuthorize.status === 'FAILED') {
        throw new BadRequestException('Payment is not authorized.');
      }

      if (dto.attachments && dto.attachments.length > 0) {
        dto.attachments.forEach(async (item) => {
          const result = await this.prisma.media.create({
            data: item,
            select: {
              id: true,
            },
          });
          attachments.push(result);
        });
      }

      const bookingDetailPrice: number[] = [];
      for (let i = 0; i < dto.articles.length; i++) {
        const allocatePricePrice = await this.prisma.allocatePrice.findUnique({
          where: {
            id: dto.articles[i].allocatePriceId,
          },
          select: {
            price: true,
          },
        });
        bookingDetailPrice.push(
          dto.articles[i].quantity * allocatePricePrice?.price,
        );
      }

      let totalPrice = 0;
      for (let i = 0; i < dto.articles.length; i++) {
        totalPrice += bookingDetailPrice[i];
      }

      const bookingMaster = await this.prisma.bookingMaster.create({
        data: {
          customerId,
          vendorId: dto.vendorId,
          tapAuthId: dto.tapAuthId,
          bookingDate: dto.bookingDate,
          ...(dto.carNumberPlate && {
            carNumberPlate: dto.carNumberPlate,
          }),
          ...(dto.instructions && { instructions: dto.instructions }),
          totalPrice: totalPrice ? totalPrice : 0,
          ...// dto?.pickupLocation?.timeFrom &&
          // dto?.pickupLocation?.timeTill &&
          {
            pickupLocationId: dto.pickupLocation.userAddressId,
            // pickupTimeFrom: dayjs(dto.pickupLocation.timeFrom).utc().format(),
            // pickupTimeTo: dayjs(dto.pickupLocation.timeTill).utc().format(),
            // dropoffTimeFrom: dayjs(dto.dropoffLocation.timeFrom).utc().format(),
            // dropoffTimeTo: dayjs(dto.dropoffLocation.timeTill).utc().format(),
          },
        },
        select: {
          bookingMasterId: true,
          bookingDate: true,
          totalPrice: true,
          vendorId: true,
          vendor: {
            select: {
              fullName: true,
              serviceType: true,
              userMasterId: true,
              userMaster: {
                select: {
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              fullName: true,
            },
          },
        },
      });

      // const bookingDetailPrice = dto.articles.map(async (bookingDetail) => {

      // })

      await this.prisma.bookingDetail.createMany({
        data: dto.articles.map((bookingDetail, index) => ({
          bookingMasterId: bookingMaster.bookingMasterId,
          allocatePriceId: bookingDetail.allocatePriceId,
          price:
            bookingDetailPrice && bookingDetailPrice.length > 0
              ? bookingDetailPrice[index]
              : 1,
          quantity: bookingDetail.quantity,
        })),
      });

      if (attachments && attachments.length > 0) {
        await this.prisma.bookingAttachments.createMany({
          data: attachments.map((item) => ({
            bookingMasterId: bookingMaster.bookingMasterId,
            mediaId: item.id,
          })),
        });
      }

      // const context = {
      //   first_paragraph:
      //     'You have received a new booking request. Please review the details below and take necessary action:',
      //   vendor_name: bookingMaster.vendor.fullName,
      //   customer_name: bookingMaster.customer.fullName,
      //   booking_id: bookingMaster.bookingMasterId,
      //   service_type: bookingMaster.vendor.serviceType,
      //   booking_date: dayjs(bookingMaster.bookingDate)
      //     .utc()
      //     .format('DD/MM/YYYY'),
      //   booking_time: dayjs(bookingMaster.bookingDate).utc().format('HH:mm'),
      //   total_amount: bookingMaster.totalPrice,
      //   app_name: this.config.get('APP_NAME'),
      //   // app_url: this.config.get(dynamicUrl(user.userType)),
      //   copyright_year: this.config.get('COPYRIGHT_YEAR'),
      //   // otp: randomOtp,
      // };
      // await this.mail.sendEmail(
      //   bookingMaster.vendor.userMaster.email,
      //   this.config.get('MAIL_ADMIN'),
      //   `${this.config.get('APP_NAME')} - New Booking`,
      //   'vendor-accept-booking', // `.hbs` extension is appended automatically
      //   context,
      // );

      const payload: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.BookingCreated,
        userId: [bookingMaster.vendor.userMasterId],
        data: {
          title: NotificationTitle.BOOKING_CREATED,
          body: NotificationBody.BOOKING_CREATED,
          type: NotificationType.BookingCreated,
          entityType: EntityType.BOOKINGMASTER,
          entityId: bookingMaster.bookingMasterId,
        },
      };
      await this.notificationService.HandleNotifications(
        payload,
        UserType.VENDOR,
      );

      return successResponse(201, 'Booking created successfully.');
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Vendor does not exist');
      }
      throw error;
    }
  }

  async getCustomerBookings(customerId: number, dto: CustomerGetBookingsDto) {
    const { page = 1, take = 10, search } = dto;
    try {
      let serviceIds: number[] = [];

      if (dto.services) {
        serviceIds = dto.services.map((service) => {
          return service.serviceId;
        });
      }
      console.log('search: ', search);
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          customerId: customerId,

          vendor: {
            ...(search && {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            }),
            ...(dto?.serviceType && {
              serviceType: dto.serviceType,
            }),
          },

          ...(dto?.status && {
            status: dto.status,
          }),

          ...(serviceIds &&
            serviceIds.length > 0 && {
              bookingDetail: {
                some: {
                  allocatePrice: {
                    vendorService: {
                      serviceId: {
                        in: serviceIds,
                      },
                    },
                  },
                },
              },
            }),
        },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          bookingMasterId: true,
          status: true,
          bookingDate: true,
          totalPrice: true,
          vendor: {
            select: {
              companyName: true,
            },
          },
          bookingDetail: {
            select: {
              allocatePrice: {
                select: {
                  vendorService: {
                    select: {
                      service: {
                        select: {
                          serviceName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          isDeleted: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCount = await this.prisma.bookingMaster.count({
        where: {
          customerId: customerId,

          vendor: {
            ...(search && {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            }),
            ...(dto?.serviceType && {
              serviceType: dto.serviceType,
            }),
          },

          ...(dto?.status && {
            status: dto.status,
          }),

          ...(serviceIds &&
            serviceIds.length > 0 && {
              bookingDetail: {
                some: {
                  allocatePrice: {
                    vendorService: {
                      serviceId: {
                        in: serviceIds,
                      },
                    },
                  },
                },
              },
            }),
        },
      });

      return { data: bookings, page: +page, take: +take, totalCount };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getCustomerBookingById(bookingMasterId: number) {
    try {
      const result = await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: bookingMasterId,
        },
        select: {
          bookingMasterId: true,
          carNumberPlate: true,
          pickupDeliveryCharges: true,
          dropoffDeliveryCharges: true,
          tapPaymentStatus: true,
          isWithDelivery: true,
          vat: true,
          vendor: {
            select: {
              vendorId: true,
              companyName: true,
              fullName: true,
              logo: {
                select: {
                  name: true,
                  key: true,
                  location: true,
                },
              },
              userAddress: {
                where: {
                  isDeleted: false,
                },
                select: {
                  fullAddress: true,
                },
              },
              userMaster: {
                select: {
                  email: true,
                  phone: true,
                },
              },
            },
          },
          bookingDetail: {
            select: {
              quantity: true,
              allocatePrice: {
                select: {
                  id: true,
                  price: true,
                  category: {
                    select: {
                      categoryName: true,
                    },
                  },
                  subcategory: {
                    select: {
                      subCategoryName: true,
                    },
                  },
                  vendorService: {
                    select: {
                      service: {
                        select: {
                          serviceName: true,
                        },
                      },
                      serviceImage: {
                        select: {
                          media: {
                            select: {
                              name: true,
                              location: true,
                              key: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          pickupLocation: {
            select: {
              fullAddress: true,
            },
          },
          dropoffLocation: {
            select: {
              fullAddress: true,
            },
          },
          pickupTimeFrom: true,
          pickupTimeTo: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
          totalPrice: true,
          instructions: true,
          isDeleted: true,
          bookingDate: true,
          status: true,

          bookingAttachments: {
            select: {
              media: {
                select: {
                  name: true,
                  key: true,
                  location: true,
                },
              },
            },
          },
        },
      });

      const platformFee = await this.prisma.platformSetup.findFirst({
        where: {
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          fee: true,
        },
      });
      if (!result) {
        throw unknowError(417, {}, 'BookingMasterId does not exist');
      }
      return { ...result, platformFee: platformFee.fee };
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async getVendorBookings(vendorId: number, dto: VendorGetBookingsDto) {
    const { page = 1, take = 10, search } = dto;
    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: {
          vendorId,
        },
        select: {
          isBusy: true,
        },
      });
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          vendorId: vendorId,
          // ...(dto.vendorServiceId && {
          //   vendor: {
          //     vendorService: {

          //     }
          //   }
          // }),
          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                bookingDetail: {
                  every: {
                    allocatePrice: {
                      vendorService: {
                        service: {
                          serviceName: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
        },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          bookingMasterId: true,
          isWithDelivery: true,
          customer: {
            select: {
              fullName: true,
            },
          },
          vendor: {
            select: {
              isBusy: true,
              vendorId: true,
              fullName: true,
            },
          },
          bookingDetail: {
            select: {
              allocatePrice: {
                select: {
                  vendorService: {
                    select: {
                      service: {
                        select: {
                          serviceName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          totalPrice: true,
          isDeleted: true,
          bookingDate: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCount = await this.prisma.bookingMaster.count({
        where: {
          vendorId: vendorId,

          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                bookingDetail: {
                  every: {
                    allocatePrice: {
                      vendorService: {
                        service: {
                          serviceName: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
        },
      });

      return {
        data: bookings,
        isBusy: vendor.isBusy,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getVendorBookingById(bookingMasterId: number) {
    try {
      let canPickup = false;
      let canDeliver = false;
      const result = await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: bookingMasterId,
        },
        select: {
          bookingMasterId: true,
          isWithDelivery: true,
          customer: {
            select: {
              fullName: true,
              userMaster: {
                select: {
                  phone: true,
                },
              },
              userAddress: {
                select: {
                  fullAddress: true,
                },
              },
            },
          },
          vat: true,
          pickupDeliveryCharges: true,
          dropoffDeliveryCharges: true,
          bookingDetail: {
            select: {
              quantity: true,
              allocatePrice: {
                select: {
                  id: true,
                  category: {
                    select: {
                      categoryName: true,
                    },
                  },
                  subcategory: {
                    select: {
                      subCategoryName: true,
                    },
                  },
                  vendorService: {
                    select: {
                      service: true,
                      serviceImage: {
                        select: {
                          media: {
                            select: {
                              name: true,
                              location: true,
                              key: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          pickupLocation: {
            select: {
              fullAddress: true,
            },
          },
          dropoffLocation: {
            select: {
              fullAddress: true,
            },
          },
          pickupTimeFrom: true,
          pickupTimeTo: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
          totalPrice: true,
          instructions: true,

          isDeleted: true,
          bookingDate: true,
          status: true,
          job: {
            select: {
              id: true,
              jobStatus: true,
              jobType: true,
              rider: {
                select: {
                  description: true,
                  fullName: true,
                  companyEmail: true,
                  companyName: true,
                  logo: {
                    select: {
                      name: true,
                      key: true,
                      location: true,
                    },
                  },
                  userAddress: {
                    where: {
                      isDeleted: true,
                    },
                    orderBy: {
                      createdAt: 'desc',
                    },
                    select: {
                      fullAddress: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
      if (!result) {
        throw unknowError(417, {}, 'BookingMasterId does not exist');
      }

      let totalItems = 0;
      result.bookingDetail.forEach((item) => {
        totalItems += item.quantity;
      });

      result?.job?.every((item) => {
        console.log('item: ', item);
        return item.jobType !== JobType.PICKUP;
      });

      if (result?.job?.every((item) => item.jobType !== JobType.PICKUP)) {
        canPickup = true;
      }

      if (
        result?.job?.every((item) => item.jobType !== JobType.DELIVERY) &&
        result?.job?.some(
          (item) =>
            item.jobType === JobType.PICKUP &&
            item.jobStatus === RiderJobStatus.Completed,
        )
      ) {
        canDeliver = true;
      }

      if (result.status !== BookingStatus.Completed) {
        delete result.job;
      }
      return { ...result, totalItems, canPickup, canDeliver };
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async updateVendorBookingStatus(
    bookingMasterId: number,
    dto: UpdateBookingStatusParam,
    user: GetUserType,
  ) {
    try {
      const findBooking = await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId,
        },
        select: {
          status: true,
          isWithDelivery: true,
          vendor: {
            select: {
              serviceType: true,
            },
          },
        },
      });

      if (
        findBooking.status !== BookingStatus.Pending &&
        findBooking.vendor.serviceType === ServiceType.LAUNDRY &&
        findBooking.isWithDelivery
      ) {
        throw new BadRequestException(
          `You cannot alter the booking status before the dropoff job has been completed.`,
        );
      }

      if (
        findBooking.status === BookingStatus.Completed ||
        findBooking.status === BookingStatus.Rejected
      ) {
        throw new BadRequestException(
          `You cannot alter the booking status after it has been ${findBooking.status.toLowerCase()}.`,
        );
      }

      if (
        dto.bookingStatus === BookingStatus.In_Progress &&
        findBooking.status === BookingStatus.Confirmed &&
        user.serviceType === ServiceType.LAUNDRY &&
        findBooking.isWithDelivery
      ) {
        const job = await this.prisma.job.findFirst({
          where: {
            bookingMasterId,
            jobType: JobType.PICKUP,
            jobStatus: RiderJobStatus.Completed,
          },
        });

        if (!job) {
          throw new BadRequestException(
            'You cannot change status to in progress without completing a pickup job first.',
          );
        }
      }

      const booking = await this.prisma.bookingMaster.update({
        where: {
          bookingMasterId,
        },
        data: {
          status: dto.bookingStatus,
          ...(dto.bookingStatus === BookingStatus.Confirmed && {
            confirmationTime: dayjs().utc().format(),
          }),

          ...(dto.bookingStatus === BookingStatus.Completed && {
            completionTime: dayjs().utc().format(),
          }),
        },
        select: {
          bookingMasterId: true,
          bookingDate: true,
          totalPrice: true,
          customerId: true,
          vendorId: true,
          status: true,
          tapAuthId: true,
          isWithDelivery: true,
          vendor: {
            select: {
              fullName: true,
              serviceType: true,
              tapMerchantId: true,
              userMasterId: true,
              userMaster: {
                select: {
                  email: true,
                },
              },
            },
          },
          customer: {
            select: {
              userMasterId: true,
              email: true,
              fullName: true,
              tapCustomerId: true,
            },
          },
        },
      });

      if (dto.bookingStatus === BookingStatus.Completed) {
        const chargePayload: createChargeRequestInterface = {
          amount: booking.totalPrice,
          currency: 'SAR',
          customer: {
            id: booking.customer.tapCustomerId,
          },
          merchant: {
            id: booking.vendor.tapMerchantId,
          },
          source: { id: booking.tapAuthId, type: 'CARD' },
          redirect: { url: `${this.config.get('APP_URL')}/tap-payment` },
          post: {
            url: `${this.config.get('APP_URL')}/tap/charge/${
              booking.vendor.userMasterId
            }/${ChargeEntityTypes.booking}/${bookingMasterId}`,
          },
        };
        const createCharge = await this.tapService.createCharge(chargePayload);
        console.log('createCharge: ', createCharge);

        const platform = await this.prisma.platformSetup.findFirst({
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            isDeleted: false,
          },
        });

        if (!booking.isWithDelivery) {
          const admin = await this.prisma.admin.findUnique({
            where: {
              userMasterId: 1,
            },
            select: {
              userMasterId: true,
              tapBranchId: true,
              tapBrandId: true,
              tapBusinessEntityId: true,
              tapBusinessId: true,
              tapMerchantId: true,
              tapPrimaryWalletId: true,
              tapWalletId: true,
            },
          });

          const adminChargePayload: createChargeRequestInterface = {
            amount: platform.fee,
            currency: 'SAR',
            customer: {
              id: booking.customer.tapCustomerId,
            },
            merchant: {
              id: admin.tapMerchantId,
            },
            source: { id: booking.tapAuthId, type: 'CARD' },
            redirect: { url: `${this.config.get('APP_URL')}/tap-payment` },
            post: {
              url: `${this.config.get('APP_URL')}/tap/charge/${
                user.userMasterId
              }/${ChargeEntityTypes.booking}/${bookingMasterId}`,
            },
          };
          await this.tapService.createCharge(adminChargePayload);
        }
      }

      // const context = {
      //   first_paragraph:
      //     booking.status === BookingStatus.Confirmed
      //       ? `The booking request for ${dayjs(booking.bookingDate)
      //           .utc()
      //           .format('DD/MM/YYYY')} & ${dayjs(booking.bookingDate)
      //           .utc()
      //           .format('HH:mm')} has been accepted`
      //       : booking.status === BookingStatus.In_Progress
      //       ? "The status of the following booking has been changed to 'In Progress':"
      //       : booking.status === BookingStatus.Completed
      //       ? 'The following booking has been successfully completed:'
      //       : '',
      //   vendor_name: booking.vendor.fullName,
      //   customer_name: booking.customer.fullName,
      //   booking_id: booking.bookingMasterId,
      //   service_type: booking.vendor.serviceType,
      //   booking_date: dayjs(booking.bookingDate).utc().format('DD/MM/YYYY'),
      //   booking_time: dayjs(booking.bookingDate).utc().format('HH:mm'),
      //   total_amount: booking.totalPrice,
      //   app_name: this.config.get('APP_NAME'),
      //   // app_url: this.config.get(dynamicUrl(user.userType)),
      //   copyright_year: this.config.get('COPYRIGHT_YEAR'),
      //   // otp: randomOtp,
      // };
      // await this.mail.sendEmail(
      //   booking.vendor.userMaster.email,
      //   this.config.get('MAIL_ADMIN'),
      //   `${this.config.get('APP_NAME')} - New Booking`,
      //   'vendor-accept-booking', // `.hbs` extension is appended automatically
      //   context,
      // );

      const payload: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.BookingStatus,
        userId: [booking.customer.userMasterId],
        data: {
          title:
            dto.bookingStatus === BookingStatus.In_Progress
              ? NotificationTitle.BOOKING_IN_PROGRESS
              : dto.bookingStatus === BookingStatus.Confirmed
              ? NotificationTitle.BOOKING_APPROVED
              : dto.bookingStatus === BookingStatus.Completed
              ? NotificationTitle.BOOKING_COMPLETED
              : NotificationTitle.BOOKING_REJECTED,
          body:
            dto.bookingStatus === BookingStatus.In_Progress
              ? NotificationBody.BOOKING_IN_PROGRESS.replace(
                  '{id}',
                  bookingMasterId.toString(),
                )
              : dto.bookingStatus === BookingStatus.Confirmed
              ? NotificationBody.BOOKING_APPROVED
              : dto.bookingStatus === BookingStatus.Completed
              ? NotificationBody.BOOKING_COMPLETED.replace(
                  '{id}',
                  bookingMasterId.toString(),
                )
              : NotificationBody.BOOKING_REJECTED.replace(
                  '{vendor}',
                  booking.vendor.fullName,
                ),
          type: NotificationType.BookingStatus,
          entityType: EntityType.BOOKINGMASTER,
          entityId: booking.bookingMasterId,
        },
      };
      await this.notificationService.HandleNotifications(
        payload,
        UserType.CUSTOMER,
      );
      console.log('Notification Sent');

      return successResponse(
        200,
        `Booking status changed to ${dto.bookingStatus}`,
      );
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async getAdminBookings(dto: AdminGetBookingsDto) {
    const { page = 1, take = 10, search } = dto;
    try {
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                vendor: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
          ...(dto?.serviceType && {
            vendor: {
              serviceType: dto.serviceType,
            },
          }),
        },

        take: +take,
        skip: +take * (+page - 1),
        select: {
          bookingMasterId: true,
          bookingDate: true,
          customer: {
            select: {
              fullName: true,
            },
          },
          vendor: {
            select: {
              fullName: true,
              serviceType: true,
            },
          },
          pickupTimeFrom: true,
          totalPrice: true,
          status: true,
          isDeleted: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCount = await this.prisma.bookingMaster.count({
        where: {
          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                vendor: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
        },
      });

      return { data: bookings, page: +page, take: +take, totalCount };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getBookingDetails(user: GetUserType, dto: BookingDetailsDto) {
    // const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    // const params = {
    //   units: 'metric',
    //   origins: `${dto.pickupLocation.latitude},${dto.pickupLocation.longitude}`,
    //   destinations: `${dto.dropoffLocation.latitude},${dto.dropoffLocation.longitude}`,
    //   key: this.config.get('GOOGLE_MAPS_API_KEY'),
    // };
    try {
      const response = {
        distance: 0,
        deliveryCharges: 0,
      };
      const vendor = await this.prisma.vendor.findUnique({
        where: {
          vendorId: dto.vendorId,
        },
        select: {
          serviceType: true,
          userAddress: {
            where: {
              isDeleted: false,
            },
            select: {
              latitude: true,
              longitude: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          deliverySchedule: {
            select: {
              kilometerFare: true,
              deliveryDurationMin: true,
              deliveryDurationMax: true,
              serviceDurationMin: true,
              serviceDurationMax: true,
            },
          },
        },
      });

      const platformFee = await this.prisma.platformSetup.findFirst({
        where: {
          isDeleted: false,
        },
        orderBy: {
          id: 'desc',
        },
        select: {
          fee: true,
        },
      });

      const bookingDetailPrice: number[] = [];
      for (let i = 0; i < dto.articles.length; i++) {
        const allocatePricePrice = await this.prisma.allocatePrice.findUnique({
          where: {
            id: dto.articles[i].allocatePriceId,
          },
          select: {
            price: true,
          },
        });
        bookingDetailPrice.push(
          dto.articles[i].quantity * allocatePricePrice?.price,
        );
      }

      let totalPrice = 0;
      for (let i = 0; i < dto.articles.length; i++) {
        totalPrice += bookingDetailPrice[i];
      }

      if (dto.isWithDelivery) {
        if (dto?.pickupLocation?.userAddressId) {
          const pickupLocation = await this.prisma.userAddress.findUnique({
            where: {
              userAddressId: dto.pickupLocation.userAddressId,
            },
            select: {
              latitude: true,
              longitude: true,
            },
          });

          dto.pickupLocation.latitude = pickupLocation.latitude;
          dto.pickupLocation.longitude = pickupLocation.longitude;
        }

        if (dto?.dropoffLocation?.userAddressId) {
          const dropoffLocation = await this.prisma.userAddress.findUnique({
            where: {
              userAddressId: dto.dropoffLocation.userAddressId,
            },
            select: {
              latitude: true,
              longitude: true,
            },
          });

          dto.dropoffLocation.latitude = dropoffLocation.latitude;
          dto.dropoffLocation.longitude = dropoffLocation.longitude;
        }
        if (vendor.serviceType === ServiceType.LAUNDRY) {
          const values = await Promise.all([
            mapsDistanceData(
              dto.pickupLocation,
              vendor.userAddress[0],
              this.config,
              this.httpService,
            ),
            mapsDistanceData(
              dto.dropoffLocation,
              vendor.userAddress[0],
              this.config,
              this.httpService,
            ),
          ]);
          console.log('values: ', values);
          for (let i = 0; i < values.length; i++) {
            if (isNaN(values[i].distanceValue)) {
              throw new BadRequestException(
                'Route does not exist between the vendor and one of these locations',
              );
            }

            response.distance += +values[i].distanceValue;
            response.deliveryCharges += Math.round(
              +values[i].distanceValue *
                (vendor?.deliverySchedule?.kilometerFare || 1),
            );
          }
        }
      }
      const customer = await this.prisma.customer.findUnique({
        where: {
          customerId: user.userTypeId,
        },
        select: {
          tapCustomerId: true,
        },
      });

      const payload = {
        ...(vendor.serviceType === ServiceType.LAUNDRY && dto.isWithDelivery
          ? {
              amount:
                Math.round(totalPrice) +
                (platformFee?.fee || 0) +
                response?.deliveryCharges,
            }
          : { amount: Math.round(totalPrice) + (platformFee?.fee || 0) }),
        currency: 'SAR',
        customer: {
          id: customer.tapCustomerId,
        },
        source: { id: 'src_card' },
        threeDSecure: true,
        redirect: { url: `${this.config.get('APP_URL')}/tap-payment` },
        auto: {
          type: 'VOID',
          time: 48,
        },
        post: {
          url: `${this.config.get('APP_URL')}/tap/authorize`,
        },
      };
      console.log('payload: ', payload);
      const url: AuthorizeResponseInterface =
        await this.tapService.createAuthorize(payload);

      return {
        distance: `${response?.distance || 0} km`,
        deliveryCharges: response?.deliveryCharges || 0,
        platformFee: platformFee?.fee || 0,
        totalPrice: Math.round(totalPrice),
        deliveryDurationMin: vendor?.deliverySchedule?.deliveryDurationMin,
        deliveryDurationMax: vendor?.deliverySchedule?.deliveryDurationMax,
        serviceDurationMin: vendor?.deliverySchedule?.serviceDurationMin,
        serviceDurationMax: vendor?.deliverySchedule?.serviceDurationMax,
        tapUrl: url.transaction.url,
      };
      // return response.rows[0].elements[0].distance.value / 1000;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException(
          'Either vendorId or userAddressId does not exist',
        );
      }
      throw error;
    }
  }

  async getAdminBookingById(bookingMasterId: number) {
    try {
      const result = await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: bookingMasterId,
        },
        select: {
          bookingMasterId: true,
          carNumberPlate: true,
          pickupDeliveryCharges: true,
          dropoffDeliveryCharges: true,
          customer: {
            select: {
              fullName: true,
              userMaster: {
                select: {
                  email: true,
                  phone: true,
                },
              },
              userAddress: {
                select: {
                  fullAddress: true,
                },
              },
            },
          },
          vendor: {
            select: {
              fullName: true,
              companyName: true,
              serviceType: true,
              userMaster: {
                select: {
                  email: true,
                  phone: true,
                },
              },
              userAddress: {
                select: {
                  fullAddress: true,
                },
              },
            },
          },
          bookingDetail: {
            select: {
              quantity: true,
              allocatePrice: {
                select: {
                  id: true,
                  price: true,
                  category: {
                    select: {
                      categoryName: true,
                    },
                  },
                  subcategory: {
                    select: {
                      subCategoryName: true,
                    },
                  },
                  vendorService: {
                    select: {
                      service: {
                        select: {
                          serviceId: true,
                          serviceName: true,
                        },
                      },
                      serviceImage: {
                        select: {
                          media: {
                            select: {
                              name: true,
                              location: true,
                              key: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          pickupLocation: {
            select: {
              fullAddress: true,
            },
          },
          dropoffLocation: {
            select: {
              fullAddress: true,
            },
          },
          pickupTimeFrom: true,
          pickupTimeTo: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
          totalPrice: true,
          instructions: true,

          isDeleted: true,
          bookingDate: true,
          status: true,
        },
      });
      if (!result) {
        throw unknowError(417, {}, 'BookingMasterId does not exist');
      }
      return result;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async deleteBooking(id: number) {
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          isDeleted: true,
        },
      });
      if (!user.isDeleted) {
        await this.prisma.userMaster.update({
          where: {
            userMasterId: id,
          },
          data: {
            isDeleted: true,
          },
        });
        return successResponse(200, 'Customer deleted successfully.');
      } else {
        return successResponse(200, 'Customer is already deleted .');
      }
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getDetailVendor(vendorId: number) {
    try {
      return await this.prisma.bookingMaster.findMany({
        where: {
          vendorId,
          isWithDelivery: true,
          OR: [
            {
              status: BookingStatus.In_Progress,
              job: {
                some: {
                  jobType: JobType.PICKUP,
                  jobStatus: RiderJobStatus.Completed,
                },
                none: {
                  jobType: JobType.DELIVERY,
                  // NOT: {
                  //   jobStatus: RiderJobStatus.Rejected
                  // }
                },
              },
            },
            {
              status: BookingStatus.Confirmed,
              // NOT: {
              //   job: {
              //     every: {
              //       jobStatus: RiderJobStatus.Rejected,
              //     },
              //   },
              // },
            },
          ],
        },
        select: {
          customer: {
            select: {
              fullName: true,
            },
          },
          bookingMasterId: true,
          status: true,
        },
      });
    } catch (error) {
      console.log('hello again');
      throw error;
    }
  }
}
