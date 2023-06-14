import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateJobDto, GetRiderJobsDto } from './dto';
import { UpdateJobDto } from './dto';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { successResponse } from 'src/helpers/response.helper';
import { BookingStatus } from '@prisma/client';
import { GetUserType } from 'src/core/dto';
dayjs.extend(utc);

@Injectable()
export class JobService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
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
    const { page = 1, take = 10, search, jobType } = listingParams;
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
          jobType: jobType,
          vendor: {
            userAddress: {
              some: {
                cityId: rider.cityId,
              },
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
          jobType: jobType,
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
