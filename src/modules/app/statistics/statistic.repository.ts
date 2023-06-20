import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  BookingStatus,
  JobType,
  RiderJobStatus,
  UserType,
} from '@prisma/client';
import { StatisticVendorAdminQueryDto } from './dto/statistic.dto';
import { StatisticUserAdminQueryDto } from './dto/statistics.user.dto';
import { GetUserType } from 'src/core/dto';
import { unknowError } from 'src/helpers/response.helper';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
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
    } catch (error) {
      throw error;
    }
  }

  async getDashboardEarnings(user: GetUserType) {
    try {
      const ratings = await this.prisma.review.aggregate({
        where: {
          vendorId: user.userTypeId,
        },
        _avg: {
          rating: true,
        },
      });
      const todayDate = dayjs().utc().format();
      const sevenDayBeforeDate = dayjs().utc().subtract(7, 'days').format();

      const totalEarnings = await this.prisma.bookingMaster.aggregate({
        where: {
          vendorId: user.userTypeId,
        },
        _sum: {
          totalPrice: true,
        },
      });

      const forLast7Days = await this.prisma.bookingMaster.aggregate({
        where: {
          vendorId: user.userTypeId,
          createdAt: {
            gte: sevenDayBeforeDate,
            lte: todayDate,
          },
        },
        _sum: {
          totalPrice: true,
        },
      });

      const sevenDayPercentage =
        (+forLast7Days._sum.totalPrice / totalEarnings._sum.totalPrice) * 100;

      return {
        reviewAverage: ratings._avg.rating || 0,
        totalEarning: totalEarnings._sum.totalPrice,
        last7Days: forLast7Days,
        last7DayPercentage: sevenDayPercentage,
      };
    } catch (error) {
      throw unknowError(417, error, '');
    }
  }

  async getRiderDashboard(user: GetUserType) {
    try {
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const totalEarning = await this.prisma.earnings.aggregate({
        where: {
          job: {
            createdAt: {
              gte: firstDay,
              lte: lastDay,
            },
            riderId: user.userTypeId,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const pickupCount = await this.prisma.job.count({
        where: {
          riderId: user.userTypeId,
          jobType: JobType.PICKUP,
          createdAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      });

      const dropoffCount = await this.prisma.job.count({
        where: {
          riderId: user.userTypeId,
          jobType: JobType.DELIVERY,
          createdAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      });
      return { dropoffCount, pickupCount, totalEarning };
    } catch (error) {
      throw unknowError(417, error, '');
    }
  }

  async getRiderTotalJobs(user: GetUserType) {
    try {
      const completeJobs = await this.prisma.job.aggregate({
        where: {
          riderId: user.userTypeId,
          jobStatus: RiderJobStatus.Completed,
        },

        _count: {
          _all: true,
        },
      });

      const comfirmedJobs = await this.prisma.job.aggregate({
        where: {
          riderId: user.userTypeId,
          jobStatus: RiderJobStatus.Accepted,
        },

        _count: {
          _all: true,
        },
      });

      const pendingJobs = await this.prisma.job.aggregate({
        where: {
          riderId: user.userTypeId,
          jobStatus: RiderJobStatus.Pending,
        },

        _count: {
          _all: true,
        },
      });

      return {
        completeJobs,
        pendingJobs,
        comfirmedJobs,
        totalJobs:
          completeJobs._count._all +
          pendingJobs._count._all +
          comfirmedJobs._count._all,
      };
    } catch (error) {}
  }
}
