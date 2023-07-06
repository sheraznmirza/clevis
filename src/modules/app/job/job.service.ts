import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateJobDto,
  GetRiderJobsDto,
  GetVendorJobsDto,
  UpdateJobStatusDto,
} from './dto';
import { UpdateJobDto } from './dto';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { successResponse } from 'src/helpers/response.helper';
import { ChargeEntityTypes, GetUserType } from 'src/core/dto';
import {
  BookingStatus,
  EntityType,
  JobType,
  NotificationType,
  RiderJobStatus,
  ServiceType,
  UserType,
} from '@prisma/client';
import { createChargeRequestInterface } from 'src/modules/tap/dto/card.dto';
import { TapService } from 'src/modules/tap/tap.service';
import { ConfigService } from '@nestjs/config';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationData } from 'src/modules/notification-socket/types';
import { NotificationBody, NotificationTitle } from 'src/constants';
import { vendors } from 'src/seeders/constants';
import { dynamicUrl } from 'src/helpers/dynamic-url.helper';
import { MailService } from 'src/modules/mail/mail.service';
dayjs.extend(utc);

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private notificationService: NotificationService,
    private tapService: TapService,
    private config: ConfigService,
  ) {}

  async create(user: GetUserType, createJobDto: CreateJobDto) {
    try {
      if (user.serviceType === ServiceType.CAR_WASH) {
        throw new BadRequestException(
          'Vendor must have a service type of Laundry',
        );
      }
      const booking = await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: createJobDto.bookingMasterId,
        },
        select: {
          customer: {
            select: {
              fullName: true,
            },
          },
          status: true,
          isWithDelivery: true,
          bookingDate: true,
          pickupTimeFrom: true,
          pickupTimeTo: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
          job: {
            where: {
              jobType: createJobDto.jobType,
              ...(createJobDto.jobType === JobType.PICKUP && {
                jobStatus: {
                  not: RiderJobStatus.Rejected,
                },
              }),
            },
            select: {
              id: true,
              jobStatus: true,
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
        },
      });

      if (!booking.isWithDelivery) {
        throw new BadRequestException(
          'Jobs can only be created for bookings where delivery is required',
        );
      }

      if (booking?.job?.length > 0) {
        throw new BadRequestException(
          'Job of this type for this booking is already created',
        );
      }

      if (
        createJobDto.jobType === JobType.PICKUP &&
        booking.status !== BookingStatus.Confirmed
      ) {
        throw new BadRequestException(
          'Pickup job can only be created if the booking status is confirmed.',
        );
      }

      if (
        createJobDto.jobType === JobType.DELIVERY &&
        booking.status !== BookingStatus.In_Progress
      ) {
        throw new BadRequestException(
          'Delivery job can only be created if the booking status is in progress.',
        );
      }

      await this.prisma.bookingMaster.update({
        where: {
          bookingMasterId: createJobDto.bookingMasterId,
        },
        data: {
          status: BookingStatus.In_Progress,
        },
      });

      const job = await this.prisma.job.create({
        data: {
          jobDate: dayjs(createJobDto.jobDate).utc().format(),
          jobTime: dayjs(createJobDto.jobTime).utc().format(),
          bookingMasterId: createJobDto.bookingMasterId,
          jobType: createJobDto.jobType,
          vendorId: user.userTypeId,
          instructions:
            createJobDto.instructions !== null
              ? createJobDto.instructions
              : undefined,
        },
        select: {
          vendorId: true,
          id: true,
          vendor: {
            select: {
              companyName: true,
              fullName: true,
              userAddress: {
                where: {
                  isDeleted: false,
                  isActive: true,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
                select: {
                  cityId: true,
                },
              },
            },
          },
        },
      });

      const rider = await this.prisma.rider.findMany({
        where: {
          isBusy: false,
          userMaster: {
            isDeleted: false,
            notificationEnabled: true,
            isActive: true,
          },
          userAddress: {
            some: {
              isDeleted: false,
              isActive: true,
              cityId: job.vendor.userAddress[0].cityId,
            },
          },
        },
        select: {
          userMasterId: true,
          fullName: true,
          userMaster: {
            select: {
              email: true,
            },
          },
        },
      });

      const riderIds = rider.map((obj) => obj.userMasterId);
      // const riderNames = rider.map((obj) => obj.fullName);

      const payload: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.VendorCreatedJob,
        userId: riderIds,
        data: {
          title: NotificationTitle.VENDOR_CREATED_JOB,

          body: NotificationBody.VENDOR_CREATED_JOB.replace(
            '{vendor}',
            job?.vendor?.fullName,
          ),
          type: NotificationType.VendorCreatedJob,
          entityType: EntityType.JOB,
          entityId: job.id,
        },
      };
      await this.notificationService.HandleNotifications(
        payload,
        UserType.RIDER,
      );

      for (let i = 0; i < rider.length; i++) {
        const context = {
          app_name: this.config.get('APP_NAME'),
          secondmessage: 'If you have any question , please contact admin.',
          first_name: rider[i].fullName,
          message: `A new job has been created by ${job.vendor.companyName}`,
          list: `<h1><em>Booking Details: </em></h1>
        <ul>
<li> Location:${
            createJobDto.jobType === JobType.PICKUP
              ? booking.pickupLocation.fullAddress
              : booking.dropoffLocation.fullAddress
          } </li> 
<li>Customer Name: ${booking.customer.fullName} </li>
<li>Delivery Date: ${dayjs(booking.bookingDate)
            .utc()
            .local()
            .format('DD/MM/YYYY')}</li>
          <li>Delivery: ${
            createJobDto.jobType === JobType.PICKUP
              ? `${dayjs(booking.pickupTimeFrom)
                  .utc()
                  .local()
                  .format('HH:mm')}-${dayjs(booking.pickupTimeTo)
                  .utc()
                  .local()
                  .format('HH:mm')}`
              : `${dayjs(booking.dropoffTimeFrom)
                  .utc()
                  .local()
                  .format('HH:mm')}-${dayjs(booking.dropoffTimeTo)
                  .utc()
                  .local()
                  .format('HH:mm')}`
          } </li>
</ul>`,

          copyright_year: this.config.get('COPYRIGHT_YEAR'),
        };
        await this.mail.sendEmail(
          rider[i].userMaster.email,
          this.config.get('MAIL_NO_REPLY'),
          `Quick Reminder:New Job Has Been Posted`,
          'vendor-create-job',
          context, // `.hbs` extension is appended automatically
        );
      }

      return successResponse(201, 'Job created successfully.');
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException(
          'Either bookingMasterId or vendorId does not exist',
        );
      } else if (error?.code === 'P2002') {
        throw new ForbiddenException(
          'Job with the same BookingId already exists',
        );
      }
      throw error;
    }
  }

  async getAllRiderJobs(riderId: number, listingParams: GetRiderJobsDto) {
    const { page = 1, take = 10, search, jobType, status } = listingParams;
    try {
      const rider = await this.prisma.userAddress.findFirst({
        where: {
          riderId: riderId,
          isDeleted: false,
        },
        select: {
          cityId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const jobs = await this.prisma.job.findMany({
        where: {
          ...(jobType && { jobType: jobType }),
          riderId,
          ...(status === RiderJobStatus.Pending && {
            AND: [
              { jobStatus: RiderJobStatus.Pending },
              // {
              //   riderJob: {
              //     none: {
              //       riderId: user.userTypeId,
              //     },
              //   },
              // },
            ],
          }),

          ...(status === RiderJobStatus.Accepted && {
            AND: [
              { jobStatus: RiderJobStatus.Accepted },
              {
                riderJob: {
                  some: {
                    riderId: riderId,
                    status: RiderJobStatus.Accepted,
                  },
                },
              },
            ],
          }),

          ...(status === RiderJobStatus.Completed && {
            AND: [
              { jobStatus: RiderJobStatus.Completed },
              {
                riderJob: {
                  some: {
                    riderId: riderId,
                    status: RiderJobStatus.Completed,
                  },
                },
              },
            ],
          }),

          ...(search && {
            OR: [
              {
                bookingMaster: {
                  customer: {
                    fullName: {
                      contains: search,
                      mode: 'insensitive',
                    },
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
          ...(status === RiderJobStatus.Pending && {
            vendor: {
              userAddress: {
                some: {
                  cityId: rider.cityId,
                },
              },
            },
          }),
        },
        orderBy: {
          createdAt: listingParams?.orderBy || 'desc',
        },
        select: {
          id: true,
          jobType: true,
          jobStatus: true,
          jobDate: true,
          jobTime: true,
          createdAt: true,
          bookingMaster: {
            select: {
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
              pickupDeliveryCharges: true,
              dropoffDeliveryCharges: true,
              status: true,

              customer: {
                select: {
                  fullName: true,
                },
              },
              vendor: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        take: +take,
        skip: +take * (+page - 1),
      });

      const totalCount = await this.prisma.job.count({
        where: {
          ...(jobType && { jobType: jobType }),

          ...(status === RiderJobStatus.Pending && {
            AND: [
              { jobStatus: RiderJobStatus.Pending },
              // {
              //   riderJob: {
              //     none: {
              //       riderId: user.userTypeId,
              //     },
              //   },
              // },
            ],
          }),

          ...(status === RiderJobStatus.Accepted && {
            AND: [
              { jobStatus: RiderJobStatus.Accepted },
              {
                riderJob: {
                  some: {
                    riderId: riderId,
                    status: RiderJobStatus.Accepted,
                  },
                },
              },
            ],
          }),

          ...(status === RiderJobStatus.Completed && {
            AND: [
              { jobStatus: RiderJobStatus.Completed },
              {
                riderJob: {
                  some: {
                    riderId: riderId,
                    status: RiderJobStatus.Completed,
                  },
                },
              },
            ],
          }),

          ...(status === RiderJobStatus.Pending && {
            vendor: {
              userAddress: {
                some: {
                  cityId: rider.cityId,
                },
              },
            },
          }),
        },
      });

      return {
        data: jobs,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllVendorJobs(vendorId: number, listingParams: GetVendorJobsDto) {
    const { page = 1, take = 10, search, jobType } = listingParams;
    try {
      const jobs = await this.prisma.job.findMany({
        where: {
          ...(jobType && { jobType: jobType }),
          vendorId: vendorId,
          ...(listingParams.status && {
            jobStatus: listingParams.status,
          }),
          ...(search && {
            bookingMaster: {
              customer: {
                fullName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          }),
          ...(listingParams.timeFrom &&
            listingParams.timeTill && {
              jobDate: {
                gte: listingParams.timeFrom,
                lte: listingParams.timeTill,
              },
            }),
        },
        orderBy: {
          createdAt: listingParams?.orderBy || 'desc',
        },
        select: {
          id: true,
          jobType: true,
          jobDate: true,
          jobTime: true,
          bookingMaster: {
            select: {
              customer: {
                select: {
                  fullName: true,
                },
              },
              status: true,
            },
          },
          rider: {
            select: {
              companyName: true,
            },
          },
        },
        take: +take,
        skip: +take * (+page - 1),
      });

      const totalCount = await this.prisma.job.count({
        where: {
          ...(jobType && { jobType: jobType }),
          vendorId: vendorId,
        },
      });

      return {
        data: jobs,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateJobStatus(
    jobId: number,
    dto: UpdateJobStatusDto,
    user: GetUserType,
  ) {
    try {
      const booking = await this.prisma.job.findFirst({
        where: {
          id: jobId,
        },
        select: {
          jobStatus: true,
          jobType: true,
          riderId: true,
          vendor: {
            select: {
              fullName: true,
              userMasterId: true,
            },
          },
          rider: {
            select: {
              fullName: true,
              userMasterId: true,
              tapMerchantId: true,
            },
          },
          riderJob: {
            where: {
              riderId: user.userTypeId,
              status: RiderJobStatus.Accepted,
            },
            select: {
              id: true,
            },
            take: 1,
          },
          bookingMaster: {
            select: {
              pickupLocation: {
                select: { fullAddress: true },
              },
              dropoffLocation: {
                select: {
                  fullAddress: true,
                },
              },
              bookingMasterId: true,
              tapAuthId: true,
              pickupDeliveryCharges: true,
              dropoffDeliveryCharges: true,
              customer: {
                select: {
                  userMasterId: true,
                  customerId: true,
                  fullName: true,
                  email: true,
                  tapCustomerId: true,
                },
              },
            },
          },
        },
      });

      if (booking.riderId !== null && booking.riderId !== user.userTypeId) {
        throw new ForbiddenException(
          'You are not permitted to update this job',
        );
      }

      if (
        booking.jobStatus === RiderJobStatus.Completed ||
        booking.jobStatus === RiderJobStatus.Rejected
      ) {
        throw new BadRequestException(
          `Job is already ${booking.jobStatus.toLowerCase()} and cannot be changed`,
        );
      }

      if (booking.jobStatus === dto.jobStatus) {
        throw new ConflictException(`Job is already ${dto.jobStatus}`);
      }

      if (
        dto.jobStatus === RiderJobStatus.Completed &&
        booking.jobStatus !== RiderJobStatus.Accepted
      ) {
        throw new BadRequestException(
          'Job needs to be accepted before it can be changed to completed',
        );
      }

      if (
        dto.jobStatus === RiderJobStatus.Completed &&
        booking.riderId === user.userTypeId
      ) {
        const riderChargePayload: createChargeRequestInterface = {
          amount:
            booking.jobType === JobType.PICKUP
              ? booking.bookingMaster.pickupDeliveryCharges
              : booking.bookingMaster.dropoffDeliveryCharges,
          currency: 'SAR',
          customer: {
            id: booking.bookingMaster.customer.tapCustomerId,
          },
          merchant: {
            id: booking.rider.tapMerchantId,
          },
          source: { id: booking.bookingMaster.tapAuthId, type: 'CARD' },
          redirect: { url: `${this.config.get('APP_URL')}/tap-payment` },
          post: {
            url: `${this.config.get('APP_URL')}/tap/charge/${
              user.userMasterId
            }/${ChargeEntityTypes.job}/${jobId}`,
          },
        };
        console.log('riderChargePayload : ', riderChargePayload);

        await this.tapService.createCharge(riderChargePayload);

        if (booking.jobType === JobType.DELIVERY) {
          const platform = await this.prisma.platformSetup.findFirst({
            orderBy: {
              createdAt: 'desc',
            },
            where: {
              isDeleted: false,
            },
            select: {
              fee: true,
            },
          });

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
              id: booking.bookingMaster.customer.tapCustomerId,
            },
            merchant: {
              id: admin.tapMerchantId,
            },
            source: { id: booking.bookingMaster.tapAuthId, type: 'CARD' },
            redirect: { url: `${this.config.get('APP_URL')}/tap-payment` },
            post: {
              url: `${this.config.get('APP_URL')}/tap/charge/${1}/${
                ChargeEntityTypes.job
              }/${jobId}`,
            },
          };
          await this.tapService.createCharge(adminChargePayload);

          await this.prisma.bookingMaster.update({
            where: {
              bookingMasterId: booking.bookingMaster.bookingMasterId,
            },
            data: {
              status: BookingStatus.Completed,
            },
          });
        }
      }

      if (
        booking.jobStatus === RiderJobStatus.Pending &&
        (dto.jobStatus === RiderJobStatus.Accepted ||
          dto.jobStatus === RiderJobStatus.Rejected)
      ) {
        await this.prisma.riderJob.create({
          data: {
            jobId: jobId,
            riderId: user.userTypeId,
            status: dto.jobStatus,
          },
        });
      }

      if (
        booking.jobStatus === RiderJobStatus.Accepted &&
        dto.jobStatus === RiderJobStatus.Completed &&
        booking &&
        booking.riderJob &&
        booking.riderJob.length > 0
      ) {
        await this.prisma.riderJob.update({
          where: {
            id: booking.riderJob[0].id,
          },
          data: {
            status: dto.jobStatus,
          },
        });
      }

      if (
        (booking.jobStatus === RiderJobStatus.Accepted &&
          dto.jobStatus === RiderJobStatus.Completed) ||
        (booking.jobStatus === RiderJobStatus.Pending &&
          dto.jobStatus === RiderJobStatus.Accepted)
      ) {
        await this.prisma.job.update({
          where: {
            id: jobId,
          },
          data: {
            jobStatus: dto.jobStatus,
            riderId: user.userTypeId,
          },
        });

        const payload: SQSSendNotificationArgs<NotificationData> = {
          type: NotificationType.RiderJob,
          userId: [booking.vendor.userMasterId],
          data: {
            title:
              dto.jobStatus === RiderJobStatus.Accepted
                ? NotificationTitle.RIDER_ACCEPT_JOB
                : NotificationTitle.RIDER_JOB_COMPLETED,
            body:
              dto.jobStatus === RiderJobStatus.Accepted
                ? NotificationBody.RIDER_ACCEPT_JOB.replace(
                    '{rider}',
                    user?.fullName,
                  )
                : NotificationBody.RIDER_JOB_COMPLETED.replace(
                    '{rider}',
                    user?.fullName,
                  ).replace('{id}', jobId.toString()),
            type: NotificationType.RiderJob,
            entityType: EntityType.JOB,
            entityId: jobId,
          },
        };
        await this.notificationService.HandleNotifications(
          payload,
          UserType.RIDER,
        );

        let riderDetail = null;
        if (dto.jobStatus === RiderJobStatus.Accepted)
          riderDetail = await this.prisma.rider.findUnique({
            where: { riderId: user.userTypeId },
            select: { fullName: true },
          });

        const payloads: SQSSendNotificationArgs<NotificationData> = {
          type: NotificationType.RiderJob,
          userId: [booking.bookingMaster.customer.userMasterId],
          data: {
            title:
              dto.jobStatus === RiderJobStatus.Accepted &&
              booking.jobType === JobType.PICKUP
                ? NotificationTitle.JOB_PICKUP_ACCEPT
                : dto.jobStatus === RiderJobStatus.Accepted &&
                  booking.jobType === JobType.DELIVERY
                ? NotificationTitle.JOB_DELIVERY_ACCEPT
                : dto.jobStatus === RiderJobStatus.Completed &&
                  booking.jobType === JobType.PICKUP
                ? NotificationTitle.JOB_PICKUP_COMPLETED
                : dto.jobStatus === RiderJobStatus.Completed &&
                  booking.jobType === JobType.DELIVERY
                ? NotificationTitle.JOB_DELIVERY_COMPLETED
                : null,
            body:
              dto.jobStatus === RiderJobStatus.Accepted &&
              booking.jobType === JobType.PICKUP
                ? NotificationBody.JOB_PICKUP_ACCEPT.replace(
                    '{rider}',
                    riderDetail?.fullName,
                  )
                : dto.jobStatus === RiderJobStatus.Accepted &&
                  booking.jobType === JobType.DELIVERY
                ? NotificationBody.JOB_DELIVERY_ACCEPT.replace(
                    '{rider}',
                    riderDetail?.fullName,
                  )
                : dto.jobStatus === RiderJobStatus.Completed &&
                  booking.jobType === JobType.PICKUP
                ? NotificationBody.JOB_PICKUP_COMPLETED.replace(
                    '{rider}',
                    booking?.rider?.fullName,
                  )
                : dto.jobStatus === RiderJobStatus.Completed &&
                  booking.jobType === JobType.DELIVERY
                ? NotificationBody.JOB_DELIVERY_COMPLETED.replace(
                    '{rider}',
                    booking?.rider?.fullName,
                  )
                : null,
            type: NotificationType.RiderJob,
            entityType: EntityType.JOB,
            entityId: jobId,
          },
        };
        await this.notificationService.HandleNotifications(
          payloads,
          UserType.CUSTOMER,
        );
      }

      const context = {
        app_name: this.config.get('APP_NAME'),

        vendor_name: booking.vendor.fullName,
        message:
          dto.jobStatus === RiderJobStatus.Accepted
            ? 'A rider has accepted your job request. They are on their way to provide the requested service.'
            : dto.jobStatus === RiderJobStatus.Completed &&
              booking.jobType === JobType.PICKUP
            ? 'The rider has successfully completed the pickup for your job.'
            : dto.jobStatus === RiderJobStatus.Completed &&
              booking.jobType === JobType.DELIVERY
            ? 'The rider has successfully completed the dropoff for your job.'
            : '',
        list: `<h1><em>Please find job details below: </em></h1>
      <ul>
      <li> 
      Job ID:${jobId} </li>
      <li> Booking ID:${booking.bookingMaster.bookingMasterId} </li>
       <li> Rider Name:${booking.rider.fullName} </li>
<li> Pickup Location:${booking.bookingMaster.pickupLocation.fullAddress} </li> 
<li> Dropoff Location:${booking.bookingMaster.dropoffLocation.fullAddress} </li>
<li>Amount: ${
          dto.jobStatus === RiderJobStatus.Completed &&
          booking.jobType === JobType.DELIVERY
            ? booking.bookingMaster.dropoffDeliveryCharges
            : dto.jobStatus === RiderJobStatus.Completed &&
              booking.jobType === JobType.PICKUP
            ? booking.bookingMaster.pickupDeliveryCharges
            : ''
        }</li>
</ul>`,

        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };

      const status =
        dto.jobStatus === RiderJobStatus.Accepted
          ? 'Job Request Accepted'
          : dto.jobStatus === RiderJobStatus.Completed &&
            booking.jobType === JobType.PICKUP
          ? 'Pickup Completed'
          : dto.jobStatus === RiderJobStatus.Completed &&
            booking.jobType === JobType.DELIVERY
          ? 'Dropoff Completed'
          : '';

      await this.mail.sendEmail(
        user.email,
        this.config.get('MAIL_NO_REPLY'),
        status,
        'rider-job-status',
        context, // `.hbs` extension is appended automatically
      );

      return successResponse(200, `Job status successfully ${dto.jobStatus}`);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const job = await this.prisma.job.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          jobType: true,
          jobStatus: true,
          instructions: true,
          rider: {
            select: {
              companyName: true,
              companyEmail: true,
              userMaster: {
                select: {
                  phone: true,
                },
              },
            },
          },
          vendor: {
            select: {
              fullName: true,
              companyEmail: true,
              userMaster: {
                select: {
                  phone: true,
                },
              },
            },
          },
          bookingMaster: {
            select: {
              bookingMasterId: true,
              customer: {
                select: {
                  fullName: true,
                  userMaster: {
                    select: {
                      phone: true,
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
              bookingDetail: {
                select: {
                  quantity: true,
                  allocatePrice: {
                    select: {
                      category: {
                        select: {
                          categoryName: true,
                        },
                      },
                    },
                  },
                },
              },
              dropoffDeliveryCharges: true,
              pickupDeliveryCharges: true,
            },
          },
          jobDate: true,
          jobTime: true,
          earnings: {
            where: {
              userMasterId: { not: 1 },
            },
            select: {
              amount: true,
            },
          },
        },
      });

      let totalItems = 0;
      job.bookingMaster.bookingDetail.forEach((item) => {
        totalItems += item.quantity;
      });

      return {
        ...job,
        totalItems,
      };
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('Job does not exist');
      }
      throw error;
    }
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
