import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';

@Injectable()
export class StatisticRepository {
  constructor(private prisma: PrismaService) {}

  async getStatistic(query) {
    try {
      const date: any = Date.now();
      if (query === 'week') {
      }

      const monthlyEntryCounts = await this.prisma.userMaster.findMany({
        where: {
          userType: UserType.VENDOR,
          createdAt: { gte: date },
          vendor: {
            serviceType: query.Usertype,
          },
        },
        select: {
          createdAt: true,
        },
      });

      const countByMonth = {};

      monthlyEntryCounts.forEach((entry) => {
        const month = entry.createdAt.getMonth();
        const year = entry.createdAt.getFullYear();
        const monthYear = `${month}-${year}`;

        if (countByMonth[monthYear]) {
          countByMonth[monthYear]++;
        } else {
          countByMonth[monthYear] = 1;
        }
      });

      const formattedEntryCounts = Object.keys(countByMonth).map(
        (monthYear) => {
          const [month, year] = monthYear.split('-');
          const count = countByMonth[monthYear];
          const date = new Date(parseInt(year), parseInt(month));
          const monthName = date.toLocaleString('default', { month: 'long' });
          return {
            month,
            year,
            count,
            monthName,
          };
        },
      );

      return formattedEntryCounts;
    } catch (error) {
      throw error;
    }
  }
}
