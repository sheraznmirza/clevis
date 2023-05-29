import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Authorized } from 'src/core/decorators';
import { UserType } from '@prisma/client';
import { RolesGuard } from 'src/core/guards';
import { JwtGuard } from '../auth/guard';
import { StatisticVendorAdminQueryDto } from './statistic.dto/statistic.dto';
@Controller('statistics')
export class StatisticsController {
  constructor(private StatisticsService: StatisticsService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.ADMIN)
  @Get('admin/vendorCount')
  getMe(@Query() query: StatisticVendorAdminQueryDto) {
    return this.StatisticsService.statisticService(query);
  }
}
