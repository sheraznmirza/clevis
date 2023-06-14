import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateJobDto, GetRiderJobsDto, UpdateJobStatusDto } from './dto';
import { UpdateJobDto } from './dto';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { successResponse } from 'src/helpers/response.helper';
import { GetUserType } from 'src/core/dto';
import { RiderJobStatus } from '@prisma/client';
import { createChargeRequestInterface } from 'src/modules/tap/dto/card.dto';
import { TapService } from 'src/modules/tap/tap.service';
dayjs.extend(utc);

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private tapService: TapService,
  ) {}

  async create(vendorId: number, createJobDto: CreateJobDto) {
    try {
      await this.prisma.job.create({
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
      });

      // Notify all the riders that a new job has been created

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

  async getAllRiderJobs(user: GetUserType, listingParams: GetRiderJobsDto) {
    const { page = 1, take = 10, search, jobType, status } = listingParams;
    try {
      const rider = await this.prisma.userAddress.findFirst({
        where: {
          riderId: user.userTypeId,
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
          createdAt: 'desc',
        },

        // select: {
        //   userAddress: {
        //     where: {
        //       isDeleted: false,

        //     },
        //     select: {
        //       cityId:true
        //     }
        //   }
        // }
      });

      const jobs = await this.prisma.job.findMany({
        where: {
          // bookingMaster: {
          //   status === listingParams.jobType
          // }
          ...(jobType && { jobType: jobType }),
          ...(status && {
            jobStatus: status,
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
              deliveryCharges: true,
              status: true,
            },
          },
        },
        take: +take,
        skip: +take * (+page - 1),
      });

      const totalCount = await this.prisma.job.count({
        where: {
          // bookingMaster: {
          //   status === listingParams.jobType
          // }
          ...(jobType && { jobType: jobType }),
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

  async getAllVendorJobs(user: GetUserType, listingParams: GetRiderJobsDto) {
    const { page = 1, take = 10, search, jobType } = listingParams;
    try {
      const jobs = await this.prisma.job.findMany({
        where: {
          ...(jobType && { jobType: jobType }),
          vendorId: user.userTypeId,
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
          vendorId: user.userTypeId,
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

  async updateJobStatus(jobId: number, dto: UpdateJobStatusDto) {
    try {
      const booking = await this.prisma.job.findFirst({
        where: {
          id: jobId,
        },
        select: {
          bookingMaster: {
            select: {
              deliveryCharges: true,
              customer: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (dto.RiderJobStatus === RiderJobStatus.Completed) {
        const chargePayload: createChargeRequestInterface = {
          amount: booking.bookingMaster.deliveryCharges,
          currency: 'AED',
          customer: {
            first_name: booking.bookingMaster.customer.fullName,
            email: booking.bookingMaster.customer.email,
          },
          source: { id: 'src_card' },
          redirect: { url: 'https://clevis-vendor.appnofy.com/tap-payment' },
        };
        const createCharge = await this.tapService.createCharge(chargePayload);
      }
      await this.prisma.job.update({
        where: {
          id: 1,
        },
        data: {
          jobStatus: dto.RiderJobStatus,
        },
      });
    } catch (error) {
      throw error;
    }
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
