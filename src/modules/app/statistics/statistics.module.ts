import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { StatisticRepository } from './statistic.repository';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticRepository],
})
export class StatisticsModule {}
