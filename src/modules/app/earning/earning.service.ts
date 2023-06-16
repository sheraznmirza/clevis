import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AllEarning, EarningDto } from './dto';
import { UserType } from '@prisma/client';
import { VendorEarning } from './dto/vendor-earning.dto';

@Injectable()
export class EarningService {
  constructor(private prisma: PrismaService) {}

  async getAllEarnings(dto: EarningDto) {
    const { page = 1, take = 10, search } = dto;

    if (dto.status === AllEarning.Receive) {
      return await this.prisma.earnings.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          isRefunded: false,
          userMaster: {
            userType: UserType.ADMIN,
          },
        },
        select: {
          bookingMaster: {
            select: {
              customer: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          createdAt: true,
          amount: true,
          bookingMasterId: true,
        },
      });
    } else if (dto.status === AllEarning.Disperse) {
      const { page = 1, take = 10, search } = dto;
      return await this.prisma.earnings.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          isRefunded: false,
          userMaster: {
            OR: [{ userType: UserType.VENDOR }, { userType: UserType.RIDER }],
          },
        },
        select: {
          job: {
            select: {
              jobType: true,
            },
          },
          bookingMaster: {
            select: {
              vendor: {
                select: {
                  serviceType: true,
                },
              },
            },
          },

          userMaster: {
            select: {
              rider: {
                select: {
                  fullName: true,
                  companyName: true,
                },
              },
              vendor: {
                select: {
                  fullName: true,
                  companyName: true,
                },
              },
            },
          },
          createdAt: true,
          amount: true,
          bookingMasterId: true,
        },
      });
    }
  }

  async getVendorEarning(vendorId: number, dto: VendorEarning) {
    const { page = 1, take = 10, search } = dto;
    return await this.prisma.earnings.findMany({
      take: +take,
      skip: +take * (+page - 1),
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isRefunded: false,
        bookingMaster: {
          vendorId,
        },
      },
      select: {
        createdAt: true,
        amount: true,

        bookingMaster: {
          select: {
            bookingMasterId: true,
            vendor: {
              select: {
                fullName: true,
                serviceType: true,
              },
            },
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
  }

  async getRiderEarning(riderId: number, dto: VendorEarning) {
    const { page = 1, take = 10, search } = dto;
    return await this.prisma.earnings.findMany({
      take: +take,
      skip: +take * (+page - 1),
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isRefunded: false,
        job: {
          riderId,
        },
      },
      select: {
        createdAt: true,
        jobId: true,
        jobType: true,
        amount: true,
        bookingMaster: {
          select: {
            pickupLocationId: true,
            dropffLocationId: true,
            status: true,
            customer: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  async getDetail(userType: number, dto: VendorEarning) {}
}
