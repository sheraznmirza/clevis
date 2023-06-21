import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Authorized } from 'src/core/decorators';
import { UserType } from '@prisma/client';
import { RolesGuard } from 'src/core/guards';
import { JwtGuard } from '../auth/guard';
import { StatisticVendorAdminQueryDto } from './dto/statistic.dto';
import { StatisticUserAdminQueryDto } from './dto/statistics.user.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUserType } from 'src/core/dto';
import { GetUser } from '../auth/decorator';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private StatisticsService: StatisticsService) {}

  @Authorized(UserType.ADMIN)
  @Get('admin/vendorCount')
  getMe(@Query() query: StatisticVendorAdminQueryDto) {
    return this.StatisticsService.statisticServiceVendor(query);
  }

  @Authorized(UserType.ADMIN)
  @Get('admin/userCount')
  getUser(@Query() query: StatisticUserAdminQueryDto) {
    return this.StatisticsService.statisticService(query);
  }

  @Authorized(UserType.VENDOR)
  @Get('/dashboard/vendor/earnings')
  getDashboardEarnings(@GetUser() user: GetUserType) {
    return this.StatisticsService.getDashboardEarnings(user);
  }

  @Authorized(UserType.VENDOR)
  @Get('/dashboard/vendor')
  getDashboard(@GetUser() user: GetUserType) {
    return this.StatisticsService.getDashboard(user);
  }

  @Authorized(UserType.RIDER)
  @Get('/Rider/dashboard/totalearning')
  geRiderDashboard(@GetUser() user: GetUserType) {
    return this.StatisticsService.getRiderDashboard(user);
  }

  @Authorized(UserType.RIDER)
  @Get('/Rider/dashboard/Totaljobs')
  geRiderTotalJobs(@GetUser() user: GetUserType) {
    return this.StatisticsService.geRiderTotalJobs(user);
  }
}
