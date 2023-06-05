import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { StatisticVendorAdminQueryDto } from './dto/statistic.dto';
import { StatisticUserAdminQueryDto } from './dto/statistics.user.dto';

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
}
