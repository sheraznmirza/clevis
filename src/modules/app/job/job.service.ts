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
dayjs.extend(utc);

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
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
          status: true,
          isWithDelivery: true,
          job: {
            where: {
              jobType: createJobDto.jobType,
            },
            select: {
              id: true,
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
        },
      });

      const riderIds = rider.map((obj) => obj.userMasterId);

      const payload: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.VendorCreatedJob,
        userId: riderIds,
        data: {
          title: NotificationTitle.VENDOR_CREATED_JOB,

          body: NotificationBody.VENDOR_CREATED_JOB.replace(
            '{vendor}',
            job.vendor.fullName,
          ),
          type: NotificationType.VendorCreatedJob,
          entityType: EntityType.RIDER,
          entityId: job.id,
        },
      };
      await this.notificationService.HandleNotifications(
        payload,
        UserType.RIDER,
      );

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
        },
        select: {
          cityId: true,
        },
        orderBy: {
          createdAt: listingParams?.orderBy || 'desc',
        },
      });

      const jobs = await this.prisma.job.findMany({
        where: {
          ...(jobType && { jobType: jobType }),

          ...(listingParams.status === RiderJobStatus.Pending && {
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

          ...(listingParams.status === RiderJobStatus.Accepted && {
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

          ...(listingParams.status === RiderJobStatus.Completed && {
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

          vendor: {
            userAddress: {
              some: {
                cityId: rider.cityId,
              },
            },
          },
        },
        select: {
          id: true,
          jobType: true,
          jobStatus: true,
          jobDate: true,
          jobTime: true,
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

          ...(listingParams.status === RiderJobStatus.Pending && {
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

          ...(listingParams.status === RiderJobStatus.Accepted && {
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

          ...(listingParams.status === RiderJobStatus.Completed && {
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

          vendor: {
            userAddress: {
              some: {
                cityId: rider.cityId,
              },
            },
          },
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
                    user.fullName,
                  )
                : NotificationBody.RIDER_JOB_COMPLETED.replace(
                    '{rider}',
                    user.fullName,
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
                    booking.rider.fullName,
                  )
                : dto.jobStatus === RiderJobStatus.Accepted &&
                  booking.jobType === JobType.DELIVERY
                ? NotificationBody.JOB_DELIVERY_ACCEPT.replace(
                    '{rider}',
                    booking.rider.fullName,
                  )
                : dto.jobStatus === RiderJobStatus.Completed &&
                  booking.jobType === JobType.PICKUP
                ? NotificationBody.JOB_PICKUP_COMPLETED.replace(
                    '{rider}',
                    booking.rider.fullName,
                  )
                : dto.jobStatus === RiderJobStatus.Completed &&
                  booking.jobType === JobType.DELIVERY
                ? NotificationBody.JOB_DELIVERY_COMPLETED.replace(
                    '{rider}',
                    booking.rider.fullName,
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
