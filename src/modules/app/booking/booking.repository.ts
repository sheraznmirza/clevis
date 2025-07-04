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
import { BullQueueService } from 'src/modules/queue/bull-queue.service';

@Injectable()
export class BookingRepository {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private httpService: HttpService,
    private tapService: TapService,
    private notificationService: NotificationService,
    private mail: MailService,
    private queue: BullQueueService,
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
      const attachments = [];
      let count = 0;

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
            take: 1,
          },
          deliverySchedule: {
            select: {
              kilometerFare: true,
              deliveryItemMin: true,
              deliveryItemMax: true,
            },
          },
        },
      });

      if (vendor.isBusy) {
        throw new BadRequestException(
          'Vendor is busy, unable to create booking',
        );
      }

      for (let i = 0; i < dto.articles.length; i++) {
        count += dto.articles[i].quantity;
      }

      if (count > vendor.deliverySchedule.deliveryItemMax) {
        throw new BadRequestException(
          'Exceeded the item quantity limit for the vendor.',
        );
      }

      if (count < vendor.deliverySchedule.deliveryItemMin) {
        throw new BadRequestException(
          'The order does not meet the minimum requirements for the item quantity limit.',
        );
      }

      // console.log('dto.tapAuthId: ', dto.tapAuthId);
      const tapAuthorize = await this.tapService.retrieveAuthorize(
        dto.tapAuthId,
      );
      if (tapAuthorize.status === 'FAILED') {
        throw new BadRequestException('Payment is not authorized.');
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

      const bookingMaster = await this.prisma.bookingMaster.create({
        data: {
          customerId,
          vendorId: dto.vendorId,
          tapAuthId: dto.tapAuthId,
          pickupDeliveryCharges: Math.round(pickupDeliveryCharges),
          dropoffDeliveryCharges: Math.round(dropoffDeliveryCharges),
          bookingDate: dayjs(dto.bookingDate).utc().format(),
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
          bookingPlatformFee: platformFee.fee,
        },
        select: {
          pickupDeliveryCharges: true,
          dropoffDeliveryCharges: true,
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
              email: true,
              userMasterId: true,
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

      if (dto.attachments && dto.attachments.length > 0) {
        for await (const iterator of dto.attachments) {
          const result = await this.prisma.media.create({
            data: iterator,
            select: {
              id: true,
            },
          });
          attachments.push(result.id);
        }
      }

      if (attachments && attachments.length > 0) {
        await this.prisma.bookingAttachments.createMany({
          data: attachments.map((item) => ({
            bookingMasterId: bookingMaster.bookingMasterId,
            mediaId: item,
          })),
        });
      }

      const context2 = {
        message: `<p>You have received a new booking request. Please review the details below and take necessary action: </p>  `,
        list: `
        
        <ul>
        <li>Booking ID: ${bookingMaster?.bookingMasterId}</li>
        <li> Customer Name: ${bookingMaster?.customer.fullName}</li>
        <li>Service Type: ${bookingMaster?.vendor.serviceType}</li>
      
            <li>Date: ${dayjs(bookingMaster.bookingDate)
              .utc()
              .local()
              .format('DD/MM/YYYY')}</li>
             
              <li>Amount: ${(
                +bookingMaster.totalPrice +
                +bookingMaster.dropoffDeliveryCharges +
                +bookingMaster.pickupDeliveryCharges
              ).toFixed(2)}</li>

          </ul> <p>Please log in to your account to <em>accept or reject</em> the booking request.</p>`,
        customer_name: bookingMaster.customer.fullName,
        booking_date: dayjs(bookingMaster.bookingDate)
          .utc()
          .local()
          .format('DD/MM/YYYY'),
        booking_time: dayjs(bookingMaster.bookingDate).utc().format('HH:mm'),
        total_amount: bookingMaster.totalPrice,
        app_name: this.config.get('APP_NAME'),
        // app_url: this.config.get(dynamicUrl(user.userType)),
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
        // otp: randomOtp,
      };
      await this.mail.sendEmail(
        bookingMaster.vendor.userMaster.email,
        this.config.get('MAIL_ADMIN'),
        `New Booking`,
        'booking.hbs', // `.hbs` extension is appended automatically
        context2,
      );

      const context = {
        message:
          'Your booking request has been sent successfully. Please check the status of your request in Bookings section.',
        list: `<ul>
            <li>Date: ${dayjs(bookingMaster.bookingDate)
              .utc()
              .local()
              .format('DD/MM/YYYY')}</li>
             
              <li>Amount: ${(
                +bookingMaster.totalPrice +
                +bookingMaster.dropoffDeliveryCharges +
                +bookingMaster.pickupDeliveryCharges
              ).toFixed(2)}</li>
          </ul>`,

        customer_name: bookingMaster.customer.fullName,
        booking_date: dayjs(bookingMaster.bookingDate)
          .utc()
          .local()
          .format('DD/MM/YYYY'),
        booking_time: dayjs(bookingMaster.bookingDate).utc().format('HH:mm'),
        total_amount: bookingMaster.totalPrice,
        app_name: this.config.get('APP_NAME'),
        // app_url: this.config.get(dynamicUrl(user.userType)),
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
        // otp: randomOtp,
      };
      await this.mail.sendEmail(
        bookingMaster.customer.email,
        this.config.get('MAIL_ADMIN'),
        `New Booking`,
        'booking.hbs', // `.hbs` extension is appended automatically
        context,
      );

      const payload2: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.BookingCreated,
        userId: [bookingMaster.customer.userMasterId],
        data: {
          title: NotificationTitle.BOOKING_SENT_CUSTOMER,
          body: NotificationBody.BOOKING_SENT_CUSTOMER.replace(
            '{id}',
            bookingMaster.bookingMasterId.toString(),
          ),
          type: NotificationType.BookingCreated,
          entityType: EntityType.BOOKINGMASTER,
          entityId: bookingMaster.bookingMasterId,
        },
      };
      await this.notificationService.HandleNotifications(
        payload2,
        UserType.CUSTOMER,
      );

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

      return {
        ...successResponse(201, 'Booking created successfully.'),
        bookingMasterId: bookingMaster.bookingMasterId,
      };
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Vendor does not exist');
      } else if (error?.code === 'P2002') {
        throw new BadRequestException('tapAuthId already used.');
      }
      if (error.response.data) {
        throw new BadRequestException(
          error.response.data.errors[0].description,
        );
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

      const bookingMaster = await this.prisma.bookingMaster.create({
        data: {
          customerId,
          vendorId: dto.vendorId,
          tapAuthId: dto.tapAuthId,
          bookingDate: dayjs(dto.bookingDate).utc().format(),
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
          bookingPlatformFee: platformFee.fee,
        },
        select: {
          pickupDeliveryCharges: true,
          dropoffDeliveryCharges: true,
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
              email: true,
              userMasterId: true,
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

      const context2 = {
        message: `<p>You have received a new booking request. Please review the details below and take necessary action: </p>  `,
        list: `
        
        <ul>
        <li>Booking ID: ${bookingMaster?.bookingMasterId}</li>
        <li> Customer Name: ${bookingMaster?.customer.fullName}</li>
        <li>Service Type: ${bookingMaster?.vendor.serviceType}</li>
      
            <li>Date: ${dayjs(bookingMaster.bookingDate)
              .utc()
              .local()
              .format('DD/MM/YYYY')}</li>
             
              <li>Amount: ${(
                +bookingMaster.totalPrice +
                +bookingMaster.dropoffDeliveryCharges +
                +bookingMaster.pickupDeliveryCharges
              ).toFixed(2)}</li>

          </ul> <p>Please log in to your account to <em>accept or reject</em> the booking request.</p>`,
        customer_name: bookingMaster.customer.fullName,
        booking_date: dayjs(bookingMaster.bookingDate)
          .utc()
          .local()
          .format('DD/MM/YYYY'),
        booking_time: dayjs(bookingMaster.bookingDate).utc().format('HH:mm'),
        total_amount: bookingMaster.totalPrice,
        app_name: this.config.get('APP_NAME'),
        // app_url: this.config.get(dynamicUrl(user.userType)),
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
        // otp: randomOtp,
      };
      await this.mail.sendEmail(
        bookingMaster.vendor.userMaster.email,
        this.config.get('MAIL_ADMIN'),
        `New Booking`,
        'booking.hbs', // `.hbs` extension is appended automatically
        context2,
      );

      const context = {
        message:
          'Your booking request has been sent successfully. Please check the status of your request in Bookings section.',
        list: `<ul>
            <li>Date: ${dayjs(bookingMaster.bookingDate)
              .utc()
              .local()
              .format('DD/MM/YYYY')}</li>
              
              <li>Amount: SR ${(
                +bookingMaster.totalPrice +
                +bookingMaster.dropoffDeliveryCharges +
                +bookingMaster.pickupDeliveryCharges
              ).toFixed(2)}</li>
          </ul>`,

        customer_name: bookingMaster.customer.fullName,
        booking_date: dayjs(bookingMaster.bookingDate)
          .utc()
          .local()
          .format('DD/MM/YYYY'),
        booking_time: dayjs(bookingMaster.bookingDate).utc().format('HH:mm'),
        total_amount: bookingMaster.totalPrice,
        app_name: this.config.get('APP_NAME'),
        // app_url: this.config.get(dynamicUrl(user.userType)),
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
        // otp: randomOtp,
      };
      await this.mail.sendEmail(
        bookingMaster.customer.email,
        this.config.get('MAIL_ADMIN'),
        `New Booking`,
        'booking.hbs', // `.hbs` extension is appended automatically
        context,
      );

      const payload2: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.BookingCreated,
        userId: [bookingMaster.customer.userMasterId],
        data: {
          title: NotificationTitle.BOOKING_SENT_CUSTOMER,
          body: NotificationBody.BOOKING_SENT_CUSTOMER.replace(
            '{id}',
            bookingMaster.bookingMasterId.toString(),
          ),
          type: NotificationType.BookingCreated,
          entityType: EntityType.BOOKINGMASTER,
          entityId: bookingMaster.bookingMasterId,
        },
      };
      await this.notificationService.HandleNotifications(
        payload2,
        UserType.CUSTOMER,
      );

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

      return {
        ...successResponse(201, 'Booking created successfully.'),
        bookingMasterId: bookingMaster.bookingMasterId,
      };
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Vendor does not exist');
      }
      if (error.response.data) {
        throw new BadRequestException(
          error.response.data.errors[0].description,
        );
      }
      throw error;
    }
  }

  async getCustomerBookings(customerId: number, dto: CustomerGetBookingsDto) {
    const { page = 1, take = 10, search, dateRange, status, serviceType } = dto;
    try {
      let serviceIds: number[] = [];
      let bookedDates: Date[] = [];
      let startDate: string;
      let endDate: string;

      if (dto.services) {
        serviceIds = dto.services.map((service) => {
          return service.serviceId;
        });
      }

      if (dateRange) {
        startDate = dayjs(dateRange.start).utc().startOf('month').format();
        endDate = dayjs(dateRange.start).utc().endOf('month').format();
      }

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
            ...(serviceType && {
              serviceType: dto.serviceType,
            }),
          },

          ...(status && {
            status: dto.status,
          }),

          ...(dateRange && {
            bookingDate: {
              gte: startDate,
              lte: endDate,
            },
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
        // ...(!dateRange && {
        take: +take,
        skip: +take * (+page - 1),
        // }),

        select: {
          bookingMasterId: true,
          status: true,
          bookingPlatformFee: true,
          bookingDate: true,
          totalPrice: true,
          pickupDeliveryCharges: true,
          dropoffDeliveryCharges: true,
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
            ...(serviceType && {
              serviceType: dto.serviceType,
            }),
          },

          ...(dateRange && {
            bookingDate: {
              gte: startDate,
              lte: endDate,
            },
          }),

          ...(status && {
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

      if (dto.dateRange) {
        bookedDates = bookings.map((booking) => booking.bookingDate);
      }

      return {
        data: bookings,
        page: +page,
        take: +take,
        totalCount,
        ...(dto.dateRange && {
          bookedDates,
        }),
      };
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
          bookingPlatformFee: true,
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
                gte: dayjs(dto.dateFrom).utc().format(),
                lte: dayjs(dto.dateTill).utc().format(),
              },
            }),
        },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          bookingAttachments: {
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
                gte: dayjs(dto.dateFrom).utc().format(),
                lte: dayjs(dto.dateTill).utc().format(),
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
          bookingPlatformFee: true,
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
                where: {
                  isActive: true,
                  isDeleted: false,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
                select: {
                  fullAddress: true,
                },
              },
            },
          },
          vendor: {
            select: {
              userAddress: {
                where: {
                  isDeleted: false,
                },
                take: 1,
                orderBy: {
                  createdAt: 'desc',
                },
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
          bookingAttachments: {
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

      return {
        ...result,
        totalItems,
        canPickup,
        canDeliver,
      };
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
          pickupDeliveryCharges: true,
          dropoffDeliveryCharges: true,
          bookingMasterId: true,
          bookingDate: true,
          totalPrice: true,
          customerId: true,
          vendorId: true,
          status: true,
          tapAuthId: true,
          isWithDelivery: true,
          bookingPlatformFee: true,
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

      if (dto.bookingStatus === BookingStatus.Completed) {
        const chargePayload: createChargeRequestInterface = {
          amount: findBooking.totalPrice,
          currency: 'SAR',
          customer: {
            id: findBooking.customer.tapCustomerId,
          },
          merchant: {
            id: findBooking.vendor.tapMerchantId,
          },
          source: { id: findBooking.tapAuthId, type: 'CARD' },
          redirect: { url: `${this.config.get('APP_URL')}/tap-payment` },
          post: {
            url: `${this.config.get('APP_URL')}/tap/charge/${
              findBooking.vendor.userMasterId
            }/${ChargeEntityTypes.booking}/${bookingMasterId}`,
          },
        };
        const createCharge = await this.tapService.createCharge(chargePayload);
        console.log('createCharge: ', createCharge);

        if (!findBooking.isWithDelivery) {
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
            amount: findBooking.bookingPlatformFee,
            currency: 'SAR',
            customer: {
              id: findBooking.customer.tapCustomerId,
            },
            merchant: {
              id: admin.tapMerchantId,
            },
            source: { id: findBooking.tapAuthId, type: 'CARD' },
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

      const context = {
        message:
          dto.bookingStatus === BookingStatus.Confirmed
            ? 'Your booking has been confirmed successfully. Please check the details of your booking in Bookings section'
            : dto.bookingStatus === BookingStatus.In_Progress
            ? 'Your booking is In Progress. Please check the details of your booking in Bookings section'
            : dto.bookingStatus === BookingStatus.Completed
            ? 'Your booking has been Completed successfully. Please check the details of your booking in Bookings section'
            : dto.bookingStatus === BookingStatus.Rejected
            ? 'Your booking request has been rejected. Please check the details of your request in Bookings section'
            : '',

        list:
          dto.bookingStatus === BookingStatus.Rejected
            ? `<ul>
                <li>Date: ${dayjs(findBooking.bookingDate)
                  .utc()
                  .local()
                  .format('DD-MM-YYYY')}</li>
                  <li>Time: ${dayjs(findBooking.bookingDate)
                    .utc()
                    .local()
                    .format('HH:mm')}</li>
                  <li>Amount: SR ${(
                    +findBooking.totalPrice +
                    +findBooking.dropoffDeliveryCharges +
                    +findBooking.pickupDeliveryCharges
                  ).toFixed(2)}</li>
              </ul>`
            : dto.bookingStatus === BookingStatus.Confirmed
            ? `<ul>
                <li>Booking ID: ${findBooking.bookingMasterId}</li>
                <li>Date: ${dayjs(findBooking.bookingDate)
                  .utc()
                  .local()
                  .format('DD/MM/YYYY')}</li>
               
                  <li>Amount: SR ${(
                    +findBooking.totalPrice +
                    +findBooking.dropoffDeliveryCharges +
                    +findBooking.pickupDeliveryCharges
                  ).toFixed(2)}</li>
              </ul>`
            : dto.bookingStatus === BookingStatus.In_Progress
            ? `<ul>
                <li>Booking ID: ${findBooking.bookingMasterId}</li>
                <li>Date: ${dayjs(findBooking.bookingDate)
                  .utc()
                  .local()
                  .format('DD/MM/YYYY')}</li>
                 
                  <li>Amount: SR ${(
                    +findBooking.totalPrice +
                    +findBooking.dropoffDeliveryCharges +
                    +findBooking.pickupDeliveryCharges
                  ).toFixed(2)}</li>
              </ul>`
            : dto.bookingStatus === BookingStatus.Completed
            ? `<ul>
                <li>Booking ID: ${findBooking.bookingMasterId}</li>
                <li>Date: ${dayjs(findBooking.bookingDate)
                  .utc()
                  .local()
                  .format('DD/MM/YYYY')}</li>
              
                  <li>Amount:  ${(
                    +findBooking.totalPrice +
                    +findBooking.dropoffDeliveryCharges +
                    +findBooking.pickupDeliveryCharges
                  ).toFixed(2)}</li>
              </ul>`
            : '',

        customer_name: findBooking.customer.fullName,
        booking_id: findBooking.bookingMasterId,
        service_type: findBooking.vendor.serviceType,
        booking_date: dayjs(findBooking.bookingDate).utc().format('DD/MM/YYYY'),
        booking_time: dayjs(findBooking.bookingDate).utc().format('HH:mm'),
        total_amount: findBooking.totalPrice,
        app_name: this.config.get('APP_NAME'),
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };
      const status =
        dto.bookingStatus === BookingStatus.Completed
          ? 'Booking Completed'
          : dto.bookingStatus === BookingStatus.Confirmed
          ? 'Booking Confirmed'
          : dto.bookingStatus === BookingStatus.In_Progress
          ? 'Booking In Progress'
          : dto.bookingStatus === BookingStatus.Rejected
          ? 'Booking Rejected'
          : '';
      await this.mail.sendEmail(
        findBooking.vendor.userMaster.email,
        this.config.get('MAIL_ADMIN'),
        status,
        'booking.hbs', // `.hbs` extension is appended automatically
        context,
      );

      await this.prisma.bookingMaster.update({
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
      });

      const payload: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.BookingStatus,
        userId: [findBooking.customer.userMasterId],
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
              ? NotificationBody.BOOKING_APPROVED.replace(
                  '{name}',
                  findBooking.customer.fullName,
                )
              : dto.bookingStatus === BookingStatus.Completed
              ? NotificationBody.BOOKING_COMPLETED.replace(
                  '{id}',
                  bookingMasterId.toString(),
                )
              : NotificationBody.BOOKING_REJECTED.replace(
                  '{Booking}',
                  bookingMasterId.toString(),
                ),
          type: NotificationType.BookingStatus,
          entityType: EntityType.BOOKINGMASTER,
          entityId: findBooking.bookingMasterId,
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
      if (error.response.data) {
        throw new BadRequestException(
          error.response.data.errors[0].description,
        );
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
                gte: dayjs(dto.dateFrom).utc().format(),
                lte: dayjs(dto.dateTill).utc().format(),
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
          pickupTimeTo: true,
          pickupTimeFrom: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
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
                gte: dayjs(dto.dateFrom).utc().format(),
                lte: dayjs(dto.dateTill).utc().format(),
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

            if (Math.round(+values[i].distanceValue) < 1) {
              throw new BadRequestException(
                'You cannot create a delivery with the same location',
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
      if (error.response.data) {
        throw new BadRequestException(
          error.response.data.errors[0].description,
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

  async timeOutBooking() {
    try {
      const expiredTime = dayjs().subtract(48, 'hours').utc().format();
      await this.prisma.bookingMaster.updateMany({
        where: {
          status: BookingStatus.Pending,
          createdAt: {
            lte: expiredTime,
          },
        },
        data: {
          status: BookingStatus.Rejected,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async bookingTimeReminder() {
    try {
      const currentDay = dayjs().utc().startOf('day').format();
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          status: BookingStatus.Pending,
          bookingDate: {
            gte: currentDay,
          },
        },
        select: {
          bookingMasterId: true,
          bookingDate: true,
          bookingPlatformFee: true,
          // bookingDetail: {
          //   select: {
          //     allocatePrice: {
          //       select: {
          //         vendorService: {
          //           select: {
          //             service: {
          //               select: {
          //                 serviceName:true
          //               }
          //             }
          //           }
          //         }
          //       }
          //     }
          //   }
          // },
          vendor: {
            select: {
              vendorId: true,
              fullName: true,
            },
          },
          customer: {
            select: {
              fullName: true,
            },
          },
        },
      });

      this.queue.bookingEmailAlertForVendor(bookings);
    } catch (error) {
      throw error;
    }
  }
}
