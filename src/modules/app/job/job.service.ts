import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreateJobDto, GetRiderJobsDto, UpdateJobStatusDto } from './dto';
import { UpdateJobDto } from './dto';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { successResponse } from 'src/helpers/response.helper';
import { GetUserType } from 'src/core/dto';
import {
  BookingStatus,
  JobType,
  RiderJobStatus,
  ServiceType,
} from '@prisma/client';
import { createChargeRequestInterface } from 'src/modules/tap/dto/card.dto';
import { TapService } from 'src/modules/tap/tap.service';
import { ConfigService } from '@nestjs/config';
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
        },
      });
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
          status: BookingStatus.Completed,
        },
      });

      await this.prisma.job.create({
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
      });

      // Notify all the riders that a new job has been created

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
          jobStatus: true,
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

      if (booking.jobStatus === dto.RiderJobStatus) {
        throw new ConflictException(`Job is already ${dto.RiderJobStatus}`);
      }

      if (dto.RiderJobStatus === RiderJobStatus.Completed) {
        const chargePayload: createChargeRequestInterface = {
          amount: booking.bookingMaster.deliveryCharges,
          currency: 'AED',
          customer: {
            first_name: booking.bookingMaster.customer.fullName,
            email: booking.bookingMaster.customer.email,
          },
          source: { id: 'src_card' },
          redirect: { url: `${this.config.get('APP_URL')}/tap-payment` },
          post: {
            url: `${this.config.get('APP_URL')}/tap/authorize`,
          },
        };
        const createCharge = await this.tapService.createCharge(chargePayload);
      }

      // await this.prisma.riderJob.create({
      //   data: {
      //     jobId: jobId,
      //     // riderId
      //   }
      // })
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
