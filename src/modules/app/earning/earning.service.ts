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
      const earnings = await this.prisma.earnings.findMany({
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

      const totalCount = await this.prisma.earnings.count({
        where: {
          isRefunded: false,
          userMaster: {
            userType: UserType.ADMIN,
          },
        },
      });

      return { data: earnings, page: +page, take: +take, totalCount };
    } else if (dto.status === AllEarning.Disperse) {
      const { page = 1, take = 10, search } = dto;
      const earnings = await this.prisma.earnings.findMany({
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

      const totalCount = await this.prisma.earnings.count({
        where: {
          isRefunded: false,
          userMaster: {
            OR: [{ userType: UserType.VENDOR }, { userType: UserType.RIDER }],
          },
        },
      });
      return { data: earnings, page: +page, take: +take, totalCount };
    }
  }

  async getVendorEarning(vendorId: number, dto: VendorEarning) {
    const { page = 1, take = 10, search } = dto;
    const earnings = await this.prisma.earnings.findMany({
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

    const totalCount = await this.prisma.earnings.count({
      where: {
        isRefunded: false,
        bookingMaster: {
          vendorId,
        },
      },
    });

    return { data: earnings, page: +page, take: +take, totalCount };
  }

  async getRiderEarning(riderId: number, dto: VendorEarning) {
    const { page = 1, take = 10, search } = dto;
    const earnings = await this.prisma.earnings.findMany({
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
        job: {
          select: {
            jobType: true,
          },
        },
        createdAt: true,
        jobId: true,
        amount: true,
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

    const totalCount = await this.prisma.earnings.count({
      where: {
        isRefunded: false,
        job: {
          riderId,
        },
      },
    });
    return { data: earnings, page: +page, take: +take, totalCount };
  }

  async getDetailRider(id: number) {
    await this.prisma.earnings.findUnique({
      where: {
        id: id,
      },
      select: {
        createdAt: true,
        jobId: true,
        amount: true,
        bookingMaster: {
          select: {
            vendor: {
              select: {
                fullName: true,
                companyName: true,
                userMaster: {
                  select: {
                    phone: true,
                  },
                },
              },
            },
            dropoffLocation: {
              select: {
                fullAddress: true,
              },
            },
            pickupLocation: {
              select: {
                fullAddress: true,
              },
            },
          },
        },
      },
    });
  }

  async getDetailVendor(id: number) {
    try {
      await this.prisma.earnings.findUnique({
        where: {
          id: id,
        },

        select: {
          bookingMasterId: true,
          createdAt: true,
          amount: true,
          bookingMaster: {
            select: {
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
    } catch (error) {
      throw error;
    }
  }

  async getDetailAdmin(id: number) {
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

    const result = await this.prisma.earnings.findUnique({
      where: {
        id,
      },
      select: {
        createdAt: true,
        bookingMasterId: true,
        bookingMaster: {
          select: {
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
    return {
      amount: platform.fee,
      ...result,
    };
  }
}
