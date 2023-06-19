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

  async getRiderDashboard(user: GetUserType) {
    try {
      const jobTypePickup = await this.prisma.job.aggregate({
        where: {
          riderId: user.userTypeId,
          jobType: JobType.PICKUP,
        },
        _count: {
          _all: true,
        },
      });

      const jobTypeDropoff = await this.prisma.job.aggregate({
        where: {
          riderId: user.userTypeId,
          jobType: JobType.DELIVERY,
        },
        _count: {
          _all: true,
        },
      });
      return { jobTypeDropoff, jobTypePickup };
    } catch (error) {
      throw unknowError(417, error, '');
    }
  }

  async geRiderTotalJobs(user: GetUserType) {
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
