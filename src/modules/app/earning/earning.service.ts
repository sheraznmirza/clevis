import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AllEarning, EarningDto, EarningDtos } from './dto';
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
          id: true,
          bookingMaster: {
            select: {
              customer: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          job: {
            select: {
              bookingMaster: {
                select: {
                  bookingMasterId: true,
                  customer: {
                    select: {
                      fullName: true,
                    },
                  },
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
          id: true,
          job: {
            select: {
              jobType: true,
              bookingMasterId: true,
            },
          },
          bookingMaster: {
            select: {
              vendor: {
                select: {
                  fullName: true,
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
                  serviceType: true,
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
        id: true,
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
        userMasterId: { not: 1 },
        job: {
          riderId,
        },
      },
      distinct: ['id'],
      select: {
        id: true,
        job: {
          select: {
            jobType: true,
            bookingMaster: {
              select: {
                vendor: {
                  select: {
                    fullName: true,
                    userMaster: {
                      select: {
                        email: true,
                      },
                    },
                  },
                },
              },
            },
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
    return await this.prisma.earnings.findUnique({
      where: {
        id: id,
      },
      select: {
        createdAt: true,
        jobId: true,
        amount: true,
        job: {
          select: {
            bookingMaster: {
              select: {
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
        },
      },
    });
  }

  async getDetailVendor(id: number) {
    try {
      return await this.prisma.earnings.findUnique({
        where: {
          id: id,
        },

        select: {
          id: true,
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

  async getDetailAdmin(id: number, dto: EarningDtos) {
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
    if (dto.status === AllEarning.Receive) {
      const result = await this.prisma.earnings.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          bookingMasterId: true,
          job: {
            select: {
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
          },
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
    } else if (dto.status === AllEarning.Disperse) {
      const results = await this.prisma.earnings.findUnique({
        where: {
          id: id,
        },

        select: {
          id: true,
          createdAt: true,
          amount: true,
          bookingMasterId: true,

          job: {
            select: {
              vendor: {
                select: {
                  banking: {
                    select: {
                      bankName: true,
                      accountNumber: true,
                      accountTitle: true,
                    },
                  },
                  fullName: true,
                  companyName: true,
                  userMaster: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
          bookingMaster: {
            select: {
              vendor: {
                select: {
                  banking: {
                    select: {
                      bankName: true,
                      accountNumber: true,
                      accountTitle: true,
                    },
                  },
                  fullName: true,
                  companyName: true,
                  userMaster: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return {
        amount: platform.fee,
        ...results,
      };
    }
  }
}
