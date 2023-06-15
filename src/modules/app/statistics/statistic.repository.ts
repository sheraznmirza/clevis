import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { BookingStatus, UserType } from '@prisma/client';
import { StatisticVendorAdminQueryDto } from './dto/statistic.dto';
import { StatisticUserAdminQueryDto } from './dto/statistics.user.dto';
import { GetUserType } from 'src/core/dto';
import { unknowError } from 'src/helpers/response.helper';

@Injectable()
export class StatisticRepository {
  constructor(private prisma: PrismaService) {}

  async getStatistic(query: StatisticVendorAdminQueryDto) {
    try {
      const monthlyEntryCounts2 = await this.prisma.userMaster.findMany({
        where: { userType: UserType.VENDOR },
        // createdAt:{gte: }},
        select: {
          createdAt: true,
          vendor: { select: { serviceType: true } },
        },
      });

      const countByMonth = {};

      monthlyEntryCounts2.forEach((entry) => {
        const month = entry.createdAt.getMonth();
        const year = entry.createdAt.getFullYear();
        const service = entry.vendor?.serviceType;
        const monthYear = `${month}-${year}-${service}`;

        if (countByMonth[monthYear]) {
          countByMonth[monthYear]++;
        } else {
          countByMonth[monthYear] = 1;
        }
      });

      const formattedEntryCounts2 = Object.keys(countByMonth).map(
        (monthYear) => {
          const [month, year, service] = monthYear.split('-');
          const count = countByMonth[monthYear];

          return {
            month,
            year,
            count,
            service,
          };
        },
      );

      return formattedEntryCounts2;
    } catch (error) {
      throw error;
    }
  }

  async getStatistics(query: StatisticUserAdminQueryDto) {
    try {
      const monthlyEntryCounts2 = await this.prisma.userMaster.findMany({
        where: { userType: UserType.CUSTOMER },
        // createdAt:{gte: }},
        select: {
          createdAt: true,
          customer: { select: { userMasterId: true } },
        },
      });

      const countByMonth = {};

      monthlyEntryCounts2.forEach((entry) => {
        const month = entry.createdAt.getMonth();
        const year = entry.createdAt.getFullYear();
        const service = entry.customer?.userMasterId;
        const monthYear = `${month}-${year}-${service}`;

        if (countByMonth[monthYear]) {
          countByMonth[monthYear]++;
        } else {
          countByMonth[monthYear] = 1;
        }
      });

      const formattedEntryCounts2 = Object.keys(countByMonth).map(
        (monthYear) => {
          const [month, year, service] = monthYear.split('-');
          const count = countByMonth[monthYear];

          return {
            month,
            year,
            count,
            service,
          };
        },
      );

      return formattedEntryCounts2;
    } catch (error) {
      throw error;
    }
  }

  async getDashboard(user: GetUserType) {
    try {
      const totalConfirm = await this.prisma.bookingMaster.aggregate({
        where: {
          vendorId: user.userTypeId,
          status: BookingStatus.Confirmed,
        },
        _count: {
          bookingMasterId: true,
        },
      });

      const totalCompleted = await this.prisma.bookingMaster.aggregate({
        where: {
          vendorId: user.userTypeId,
          status: BookingStatus.Completed,
        },
        _count: {
          bookingMasterId: true,
        },
      });

      const totalRejected = await this.prisma.bookingMaster.aggregate({
        where: {
          vendorId: user.userTypeId,
          status: BookingStatus.Rejected,
        },
        _count: {
          bookingMasterId: true,
        },
      });

      return {
        totalOrders:
          totalConfirm._count.bookingMasterId +
          totalCompleted._count.bookingMasterId +
          totalRejected._count.bookingMasterId,
        totalConfirm: totalConfirm._count.bookingMasterId,
        totalCompleted: totalCompleted._count.bookingMasterId,
        totalRejected: totalRejected._count.bookingMasterId,
      };

      // const result = await this.prisma.vendorService.findMany({
      //   where: {
      //     vendorId: user.userTypeId,
      //   },
      //   select: {
      //     vendorServiceId: true,
      //   },
      // });
      // const vendorServiceIds = result.map((item) => item.vendorServiceId);

      // const allocatePrices = await this.prisma.allocatePrice.findMany({
      //   where: {
      //     vendorServiceId: {
      //       in: vendorServiceIds,
      //     },
      //   },
      //   select: {
      //     bookingDetail: {
      //       select: {
      //         allocatePriceId: true,
      //       },
      //     },
      //   },
      // });
      // const allocatePriceIds = allocatePrices.map((item) =>
      //   item.bookingDetail.map((obj) => obj.allocatePriceId),
      // );

      // let array = [];
      // allocatePriceIds.forEach((arr) => (array = [...array, ...arr]));
      // const data = await this.prisma.bookingMaster.findMany({
      //   where: {
      //     isDeleted: false,
      //     vendorId: user.userTypeId,
      //     bookingDetail: {
      //       some: {
      //         allocatePriceId: {
      //           in: array,
      //         },
      //       },
      //     },
      //   },
      //   select: {
      //     bookingDetail: {
      //       select: {
      //         allocatePrice: {
      //           select: {
      //             vendorService: {
      //               select: {
      //                 service: {
      //                   select: { serviceId: true, serviceName: true },
      //                 },
      //               },
      //             },
      //             category: {
      //               select: { categoryId: true, categoryName: true },
      //             },
      //             price: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      // });

      // const services = {};

      // data.forEach((booking) => {
      //   booking.bookingDetail.forEach((detail) => {
      //     const { serviceName } = detail.allocatePrice.vendorService.service;
      //     const price = detail.allocatePrice.price;
      //     if (services[serviceName]) {
      //       services[serviceName] += price;
      //     } else {
      //       services[serviceName] = price;
      //     }
      //   });
      // });

      // return { services, data };
    } catch (error) {
      throw error;
    }
  }

  async getDashboardEarnings(user: GetUserType) {
    try {
      const result = await this.prisma.bookingMaster.aggregate({
        where: {
          vendorId: user.userTypeId,
        },
        _sum: {
          totalPrice: true,
        },
      });
      return result;
    } catch (error) {
      throw unknowError(417, error, '');
    }
  }
}
