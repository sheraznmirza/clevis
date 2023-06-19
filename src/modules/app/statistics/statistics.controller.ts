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

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private StatisticsService: StatisticsService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.ADMIN)
  @Get('admin/vendorCount')
  getMe(@Query() query: StatisticVendorAdminQueryDto) {
    return this.StatisticsService.statisticService(query);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.ADMIN)
  @Get('admin/userCount')
  getUser(@Query() query: StatisticUserAdminQueryDto) {
    return this.StatisticsService.statisticService(query);
  }

  @Authorized(UserType.VENDOR)
  @Get('/dashboard/Earnings')
  getDashboardEarnings(@GetUser() user: GetUserType) {
    return this.StatisticsService.getDashboardEarnings(user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.VENDOR)
  @Get('/dashboard')
  getDashboard(@GetUser() user: GetUserType) {
    return this.StatisticsService.getDashboard(user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.RIDER)
  @Get('/Rider/dashboard')
  geRiderDashboard(@GetUser() user: GetUserType) {
    return this.StatisticsService.getRiderDashboard(user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.RIDER)
  @Get('/Rider/dashboard/Totaljobs')
  geRiderTotalJobs(@GetUser() user: GetUserType) {
    return this.StatisticsService.geRiderTotalJobs(user);
  }
}
