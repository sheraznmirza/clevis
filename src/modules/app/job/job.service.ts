import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto';
import { UpdateJobDto } from './dto';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { successResponse } from 'src/helpers/response.helper';
import {
  BookingStatus,
  EntityType,
  NotificationType,
  UserType,
} from '@prisma/client';
import { NotificationData } from 'src/modules/notification-socket/types';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationBody, NotificationTitle } from 'src/constants';
import { riders } from 'src/seeders/constants';
dayjs.extend(utc);

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(vendorId: number, createJobDto: CreateJobDto) {
    try {
      const job = await this.prisma.job.create({
        data: {
          jobDate: dayjs(createJobDto.jobDate).utc().format(),
          jobTime: dayjs(createJobDto.jobTime).utc().format(),
          bookingMasterId: createJobDto.bookingMasterId,
          jobType: createJobDto.jobType,
          vendorId,
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

      // Notify all the riders that a new job has been created

      // const context = {
      //   vendor_name: rider,
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
        type: NotificationType.VendorCreatedJob,
        userId: riderIds,
        data: {
          title: NotificationTitle.VENDOR_CREATED_JOB,
          body: NotificationBody.VENDOR_CREATED_JOB,
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
      }
      throw error;
    }
  }

  async getAllJobs() {
    try {
      // const jobs = await this.prisma.job.findMany({
      //   where: {
      //     bookingMaster: {
      //       status === BookingStatus.
      //     }
      //   }
      // })
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all job`;
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
