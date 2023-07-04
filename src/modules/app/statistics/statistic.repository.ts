import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BookingStatus,
  JobType,
  RiderJobStatus,
  UserType,
} from '@prisma/client';
import { StatisticVendorAdminQueryDto } from './dto/statistic.dto';
import { StatisticUserAdminQueryDto } from './dto/statistics.user.dto';
import { GetUserType, YearlyFilterDropdownType } from 'src/core/dto';
import { unknowError } from 'src/helpers/response.helper';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  byMonthArray,
  byMonthArrayCompleted,
  byMonthArrayFee,
  byMonthArrays,
  byWeekArrayCompleted,
  byWeekArrayFee,
  byWeekVendors,
  byYearArray,
  byYearArrayFee,
  byYearArrays,
  byYearArrayscompleted,
  customerCountByWeek,
} from './constants';
dayjs.extend(utc);
@Injectable()
export class StatisticRepository {
  constructor(private prisma: PrismaService) {}

  async getStatisticVendor(query: StatisticVendorAdminQueryDto) {
    try {
      if (query.tabName === YearlyFilterDropdownType.YEARLY) {
        const currentYear = dayjs().format('01-01-YYYY');

        const vendorsByYear: Array<{
          laundryVendors: number;
          carWashVendors: number;
          month: string;
        }> = await this.prisma.$queryRaw`SELECT
        COUNT(CASE WHEN public."Vendor"."serviceType" = 'LAUNDRY' THEN 1 ELSE NULL END)::INTEGER AS "laundryVendors",
        COUNT(CASE WHEN public."Vendor"."serviceType" = 'CAR_WASH' THEN 1 ELSE NULL END)::INTEGER AS "carWashVendors",
        TO_CHAR(public."UserMaster"."createdAt", 'Mon') AS "month"
        FROM public."Vendor"
        INNER JOIN public."UserMaster"
        ON public."Vendor"."userMasterId" = public."UserMaster"."userMasterId"
        WHERE public."UserMaster"."createdAt" >= ${currentYear}::DATE
        GROUP BY "month";`;

        for (let i = 0; i < vendorsByYear.length; i++) {
          for (let j = 0; j < byYearArray.length; j++) {
            if (byYearArray[j].month === vendorsByYear[i].month) {
              byYearArray[j].carWashVendors = vendorsByYear[i].carWashVendors;
              byYearArray[j].laundryVendors = vendorsByYear[i].laundryVendors;
            }
          }
        }
        return byYearArray;
      } else if (query.tabName === YearlyFilterDropdownType.MONTHLY) {
        const currentYear = dayjs().format('MM-01-YYYY');
        console.log('currentYear: ', currentYear);

        const vendorsByMonth: Array<{
          laundryVendors: number;
          carWashVendors: number;
          day: number;
        }> = await this.prisma.$queryRaw`SELECT
       COUNT(CASE WHEN public."Vendor"."serviceType" = 'LAUNDRY' THEN 1 ELSE NULL END)::INTEGER AS "laundryVendors",
       COUNT(CASE WHEN public."Vendor"."serviceType" = 'CAR_WASH' THEN 1 ELSE NULL END)::INTEGER AS "carWashVendors",
       TO_CHAR(public."UserMaster"."createdAt", 'DD')::INTEGER AS "day"
       FROM public."Vendor"
       INNER JOIN public."UserMaster"
       ON public."Vendor"."userMasterId" = public."UserMaster"."userMasterId"
       WHERE public."UserMaster"."createdAt" >= ${currentYear}::DATE
       GROUP BY "day"
       ORDER BY "day" ASC;`;

        for (let i = 0; i < vendorsByMonth.length; i++) {
          for (let j = 0; j < byMonthArray.length; j++) {
            if (byMonthArray[j].day === vendorsByMonth[i].day) {
              byMonthArray[j].carWashVendors = vendorsByMonth[i].carWashVendors;
              byMonthArray[j].laundryVendors = vendorsByMonth[i].laundryVendors;
            }
          }
        }

        return byMonthArray;
      } else if (query.tabName === YearlyFilterDropdownType.WEEKLY) {
        const startOfTheWeek = dayjs().day(0).format('MM-DD-YYYY');
        const endOfTheWeek = dayjs().day(6).format('MM-DD-YYYY');

        const vendorsByWeek: Array<{
          laundryVendors: number;
          carWashVendors: number;
          weekDay: string;
        }> = await this.prisma.$queryRaw`SELECT
        COUNT(CASE WHEN public."Vendor"."serviceType" = 'LAUNDRY' THEN 1 ELSE NULL END)::INTEGER AS "laundryVendors",
        COUNT(CASE WHEN public."Vendor"."serviceType" = 'CAR_WASH' THEN 1 ELSE NULL END)::INTEGER AS "carWashVendors",
        TO_CHAR(public."UserMaster"."createdAt", 'Dy') AS "weekDay"
        FROM public."Vendor"
        INNER JOIN public."UserMaster"
        ON public."Vendor"."userMasterId" = public."UserMaster"."userMasterId"
        WHERE
          public."UserMaster"."createdAt" >= ${startOfTheWeek}::DATE
          AND public."UserMaster"."createdAt" <= ${endOfTheWeek}::DATE
        GROUP BY "weekDay";`;

        for (let i = 0; i < byWeekVendors.length; i++) {
          for (let j = 0; j < vendorsByWeek.length; j++) {
            if (byWeekVendors[j].weekDay === byWeekVendors[i].weekDay) {
              byWeekVendors[j].carWashVendors = byWeekVendors[i].carWashVendors;
              byWeekVendors[j].laundryVendors = byWeekVendors[i].laundryVendors;
            }
          }
        }

        return byWeekVendors;
      } else {
        throw new BadRequestException('Send the correct tab');
      }
    } catch (error) {
      throw error;
    }
  }

  async adminEarning(query: StatisticUserAdminQueryDto) {
    try {
      if (query.tabName === YearlyFilterDropdownType.YEARLY) {
        const currentYear = dayjs().format('01-01-YYYY');

        const feeByYear: Array<{
          fee: number;
          month: string;
        }> = await this.prisma.$queryRaw`SELECT
        SUM(CASE WHEN public."Earnings"."userMasterId" = 1 THEN public."Earnings"."amount" ELSE NULL END)::INTEGER AS "fee",
        TO_CHAR(public."Earnings"."createdAt", 'Mon') AS "month"
        FROM public."Earnings"
        WHERE public."Earnings"."createdAt" >= ${currentYear}::DATE
        GROUP BY "month";`;

        for (let i = 0; i < feeByYear.length; i++) {
          for (let j = 0; j < byYearArrayFee.length; j++) {
            if (byYearArrayFee[j].month === feeByYear[i].month) {
              byYearArrayFee[j].fee = feeByYear[i].fee;
            }
          }
        }
        return byYearArrayFee;
      } else if (query.tabName === YearlyFilterDropdownType.MONTHLY) {
        const currentYear = dayjs().format('MM-01-YYYY');

        const feeByMonth: Array<{
          fee: number;
          day: number;
        }> = await this.prisma.$queryRaw`SELECT
          SUM(CASE WHEN public."Earnings"."userMasterId" = 1 THEN public."Earnings"."amount" ELSE NULL END)::INTEGER AS "fee",
       TO_CHAR(public."Earnings"."createdAt", 'DD')::INTEGER AS "day"
       FROM public."Earnings"
       WHERE public."Earnings"."createdAt" >= ${currentYear}::DATE
       GROUP BY "day"
       ORDER BY "day" ASC;`;

        for (let i = 0; i < feeByMonth.length; i++) {
          for (let j = 0; j < byMonthArrayFee.length; j++) {
            if (byMonthArrayFee[j].day === feeByMonth[i].day) {
              byMonthArrayFee[j].fee = feeByMonth[i].fee || 0;
            }
          }
        }

        return byMonthArrayFee;
      } else if (query.tabName === YearlyFilterDropdownType.WEEKLY) {
        const startOfTheWeek = dayjs().day(0).format('MM-DD-YYYY');
        const endOfTheWeek = dayjs().day(6).format('MM-DD-YYYY');

        const feeByWeek: Array<{
          fee: number;
          weekDay: string;
        }> = await this.prisma.$queryRaw`SELECT
          SUM(CASE WHEN public."Earnings"."userMasterId" = 1 THEN public."Earnings"."amount" ELSE NULL END)::INTEGER AS "fee",
       TO_CHAR(public."Earnings"."createdAt", 'dy') AS "weekDay"
       FROM public."Earnings"
       WHERE public."Earnings"."createdAt" >= ${startOfTheWeek}::DATE
       AND public."Earnings"."createdAt" <= ${endOfTheWeek}::DATE
       GROUP BY "weekDay"
       ORDER BY "weekDay" ASC;`;

        for (let i = 0; i < byWeekArrayFee.length; i++) {
          for (let j = 0; j < feeByWeek.length; j++) {
            if (feeByWeek[j].weekDay === byWeekArrayFee[i].weekDay) {
              feeByWeek[j].fee = byWeekArrayFee[i].fee || 0;
            }
          }
        }

        return byWeekArrayFee;
      }
    } catch (error) {
      throw error;
    }
  }

  async getStatistics(query: StatisticUserAdminQueryDto) {
    try {
      if (query.tabName === YearlyFilterDropdownType.YEARLY) {
        const currentYear = dayjs().format('01-01-YYYY');

        const customersByYear: Array<{
          customerCount: number;
          month: string;
        }> = await this.prisma.$queryRaw`SELECT
        COUNT(CASE WHEN public."UserMaster"."userType" = 'CUSTOMER' THEN 1 ELSE NULL END)::INTEGER AS "customerCount",
        TO_CHAR(public."UserMaster"."createdAt", 'Mon') AS "month"
        FROM public."UserMaster"
        WHERE public."UserMaster"."createdAt" >= ${currentYear}::DATE
        GROUP BY "month";`;

        for (let i = 0; i < customersByYear.length; i++) {
          for (let j = 0; j < byYearArrays.length; j++) {
            if (byYearArrays[j].month === customersByYear[i].month) {
              byYearArrays[j].customerCount = customersByYear[i].customerCount;
            }
          }
        }
        return byYearArrays;
      } else if (query.tabName === YearlyFilterDropdownType.MONTHLY) {
        const currentYear = dayjs().format('MM-01-YYYY');

        const customerByMonth: Array<{
          customerCount: number;
          day: number;
        }> = await this.prisma.$queryRaw`SELECT
          COUNT(CASE WHEN public."UserMaster"."userType" = 'CUSTOMER' THEN 1 ELSE NULL END)::INTEGER AS "customerCount",
       TO_CHAR(public."UserMaster"."createdAt", 'DD')::INTEGER AS "day"
       FROM public."UserMaster"
       WHERE public."UserMaster"."createdAt" >= ${currentYear}::DATE
       GROUP BY "day"
       ORDER BY "day" ASC;`;

        for (let i = 0; i < customerByMonth.length; i++) {
          for (let j = 0; j < byMonthArrays.length; j++) {
            if (byMonthArrays[j].day === customerByMonth[i].day) {
              byMonthArrays[j].customerCount = customerByMonth[i].customerCount;
            }
          }
        }

        return byMonthArrays;
      } else if (query.tabName === YearlyFilterDropdownType.WEEKLY) {
        const startOfTheWeek = dayjs().day(0).format('MM-DD-YYYY');
        const endOfTheWeek = dayjs().day(6).format('MM-DD-YYYY');

        const customerByMonth: Array<{
          customerCount: number;
          weekDay: string;
        }> = await this.prisma.$queryRaw`SELECT
          COUNT(CASE WHEN public."UserMaster"."userType" = 'CUSTOMER' THEN 1 ELSE NULL END)::INTEGER AS "customerCount",
       TO_CHAR(public."UserMaster"."createdAt", 'dy') AS "weekDay"
       FROM public."UserMaster"
       WHERE public."UserMaster"."createdAt" >= ${startOfTheWeek}::DATE
       AND public."UserMaster"."createdAt" <= ${endOfTheWeek}::DATE
       GROUP BY "weekDay"
       ORDER BY "weekDay" ASC;`;

        for (let i = 0; i < customerByMonth.length; i++) {
          for (let j = 0; j < customerCountByWeek.length; j++) {
            if (customerCountByWeek[j].weekDay === customerByMonth[i].weekDay) {
              customerCountByWeek[j].customerCount =
                customerByMonth[i].customerCount;
            }
          }
        }

        return customerCountByWeek;
      } else {
        throw new BadRequestException('Send the correct tab');
      }
    } catch (error) {
      throw error;
    }
  }

  async vendorEarnings(
    userMasterId: number,
    query: StatisticUserAdminQueryDto,
  ) {
    try {
      if (query.tabName === YearlyFilterDropdownType.YEARLY) {
        const currentYear = dayjs().format('01-01-YYYY');

        const feeByYear: Array<{
          fee: number;
          month: string;
        }> = await this.prisma.$queryRaw`SELECT
    SUM(CASE WHEN public."Earnings"."userMasterId" = ${userMasterId} THEN public."Earnings"."amount" ELSE NULL END)::FLOAT AS "fee",
    TO_CHAR(public."Earnings"."createdAt", 'Mon') AS "month"
    FROM public."Earnings"
    WHERE public."Earnings"."createdAt" >= ${currentYear}::DATE
    GROUP BY "month";`;

        for (let i = 0; i < feeByYear.length; i++) {
          for (let j = 0; j < byYearArrayFee.length; j++) {
            if (byYearArrayFee[j].month === feeByYear[i].month) {
              byYearArrayFee[j].fee = feeByYear[i].fee || 0;
            }
          }
        }
        return byYearArrayFee;
      } else if (query.tabName === YearlyFilterDropdownType.MONTHLY) {
        const currentYear = dayjs().format('MM-01-YYYY');
        console.log('currentYear: ', currentYear);

        const feeByMonth: Array<{
          fee: number;
          day: number;
        }> = await this.prisma.$queryRaw`SELECT
          SUM(CASE WHEN public."Earnings"."userMasterId" != 1 THEN public."Earnings"."amount" ELSE NULL END)::INTEGER AS "fee",
       TO_CHAR(public."Earnings"."createdAt", 'DD')::INTEGER AS "day"
       FROM public."Earnings"
       WHERE public."Earnings"."createdAt" >= ${currentYear}::DATE
       GROUP BY "day"
       ORDER BY "day" ASC;`;

        for (let i = 0; i < feeByMonth.length; i++) {
          for (let j = 0; j < byMonthArrayFee.length; j++) {
            if (byMonthArrayFee[j].day === feeByMonth[i].day) {
              byMonthArrayFee[j].fee = feeByMonth[i].fee;
            }
          }
        }

        return byMonthArrayFee;
      } else if (query.tabName === YearlyFilterDropdownType.WEEKLY) {
        const startOfTheWeek = dayjs().day(0).format('MM-DD-YYYY');
        const endOfTheWeek = dayjs().day(6).format('MM-DD-YYYY');

        const feeByWeek: Array<{
          fee: number;
          weekDay: string;
        }> = await this.prisma.$queryRaw`SELECT
          SUM(CASE WHEN public."Earnings"."userMasterId" = ${userMasterId} THEN public."Earnings"."amount" ELSE NULL END)::INTEGER AS "fee",
       TO_CHAR(public."Earnings"."createdAt", 'Dy') AS "weekDay"
       FROM public."Earnings"
       WHERE public."Earnings"."createdAt" >= ${startOfTheWeek}::DATE
       AND public."Earnings"."createdAt" <= ${endOfTheWeek}::DATE
       GROUP BY "weekDay"
       ORDER BY "weekDay" ASC;`;

        for (let i = 0; i < feeByWeek.length; i++) {
          for (let j = 0; j < byWeekArrayFee.length; j++) {
            if (byWeekArrayFee[j].weekDay === feeByWeek[i].weekDay) {
              byWeekArrayFee[j].fee = feeByWeek[i].fee;
            }
          }
        }

        return byWeekArrayFee;
      }
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
        _count: {
          rating: true,
        },
        _avg: {
          rating: true,
        },
      });
      const todayDate = dayjs().utc().format();
      const sevenDayBeforeDate = dayjs().utc().subtract(7, 'days').format();

      const totalEarnings = await this.prisma.earnings.aggregate({
        where: {
          userMasterId: user.userMasterId,
        },
        _sum: {
          amount: true,
        },
      });

      const forLast7Days = await this.prisma.earnings.aggregate({
        where: {
          userMasterId: user.userMasterId,
          createdAt: {
            gte: sevenDayBeforeDate,
            lte: todayDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const sevenDayPercentage =
        (+forLast7Days._sum.amount / totalEarnings._sum.amount) * 100;

      return {
        reviewCount: ratings._count.rating,
        reviewAverage: ratings._avg.rating || 0,
        totalEarning: totalEarnings._sum.amount,
        last7Days: forLast7Days,
        last7DayPercentage: sevenDayPercentage,
      };
    } catch (error) {
      throw unknowError(417, error, '');
    }
  }

  async getRiderDashboard(user: GetUserType) {
    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
      return {
        dropoffCount,
        pickupCount,
        totalEarnings: totalEarning._sum.amount,
      };
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
  async getCompletdJob(query: StatisticVendorAdminQueryDto) {
    try {
      console.log('ja raha hai abhi tak?');
      if (query.tabName === YearlyFilterDropdownType.YEARLY) {
        console.log('is it here');
        const currentYear = dayjs().format('01-01-YYYY');

        const completedByYear: Array<{
          completedJobs: number;
          month: string;
        }> = await this.prisma.$queryRaw`SELECT
        COUNT(CASE WHEN public."Job"."jobStatus" = 'Completed' THEN 1 ELSE NULL END)::INTEGER AS "completedJobs",
        TO_CHAR(public."UserMaster"."createdAt", 'Mon') AS "month"
        -- FROM public."Job"
        FROM public."Rider"
        INNER JOIN public."UserMaster"
        ON public."Rider"."userMasterId" = public."UserMaster"."userMasterId"
        INNER JOIN public."Job"
        ON public."Job"."riderId" = public."Rider"."riderId"
        WHERE public."Job"."createdAt" >= ${currentYear}::DATE
        GROUP BY "month";`;

        console.log('byYearArrayscompleted: ', completedByYear);

        for (let i = 0; i < completedByYear.length; i++) {
          for (let j = 0; j < byYearArrayscompleted.length; j++) {
            if (byYearArrayscompleted[j].month === completedByYear[i].month) {
              byYearArrayscompleted[j].completedJobs =
                completedByYear[i].completedJobs;
            }
          }
        }
        console.log('byYearArrayscompleted: ', byYearArrayscompleted);
        return byYearArrayscompleted;
      } else if (query.tabName === YearlyFilterDropdownType.MONTHLY) {
        const currentYear = dayjs().format('MM-01-YYYY');
        console.log('currentYear: ', currentYear);

        const completedByMonth: Array<{
          completedJobs: number;
          day: number;
        }> = await this.prisma.$queryRaw`SELECT
         COUNT(CASE WHEN public."Job"."jobStatus" = 'Completed' THEN 1 ELSE NULL END)::INTEGER AS "completedJobs",
       TO_CHAR(public."Job"."createdAt", 'DD')::INTEGER AS "day"
       FROM public."Job"
      --  INNER JOIN public."UserMaster"
      --   ON public."Rider"."userMasterId" = public."UserMaster"."userMasterId"
      --   INNER JOIN public."Job"
      --   ON public."Job"."riderId" = public."Rider"."riderId"
       WHERE public."Job"."createdAt" >= ${currentYear}::DATE
       GROUP BY "day"
       ORDER BY "day" ASC;`;

        for (let i = 0; i < completedByMonth.length; i++) {
          for (let j = 0; j < byMonthArrayCompleted.length; j++) {
            if (byMonthArrayCompleted[j].day === completedByMonth[i].day) {
              byMonthArrayCompleted[j].completedJobs =
                completedByMonth[i].completedJobs;
            }
          }
        }

        return byMonthArrayCompleted;
      } else if (query.tabName === YearlyFilterDropdownType.WEEKLY) {
        const startOfTheWeek = dayjs().day(0).format('MM-DD-YYYY');
        const endOfTheWeek = dayjs().day(6).format('MM-DD-YYYY');

        const completedByWeek: Array<{
          completedJobs: number;
          weekDay: string;
        }> = await this.prisma.$queryRaw`SELECT
         COUNT(CASE WHEN public."Job"."jobStatus" = 'Completed' THEN 1 ELSE NULL END)::INTEGER AS "completedJobs",
       TO_CHAR(public."Job"."createdAt", 'Dy')::INTEGER AS "weekDay"
       FROM public."Job"
      --  INNER JOIN public."UserMaster"
      --   ON public."Rider"."userMasterId" = public."UserMaster"."userMasterId"
      --   INNER JOIN public."Job"
      --   ON public."Job"."riderId" = public."Rider"."riderId"
       WHERE public."Job"."createdAt" >= ${startOfTheWeek}::DATE
       AND public."Job"."createdAt" <= ${endOfTheWeek}::DATE
       GROUP BY "weekDay"
       ORDER BY "weekDay" ASC;`;

        for (let i = 0; i < completedByWeek.length; i++) {
          for (let j = 0; j < byWeekArrayCompleted.length; j++) {
            if (
              byWeekArrayCompleted[j].weekDay === completedByWeek[i].weekDay
            ) {
              byWeekArrayCompleted[j].completedJobs =
                completedByWeek[i].completedJobs;
            }
          }
        }
        return byWeekArrayCompleted;
      }
    } catch (error) {
      throw error;
    }
  }
}
