import { Injectable } from '@nestjs/common';
import { StatisticRepository } from './statistic.repository';
import { StatisticVendorAdminQueryDto } from './dto/statistic.dto';

@Injectable()
export class StatisticsService {
  constructor(private repository: StatisticRepository) {}

  async statisticService(query: StatisticVendorAdminQueryDto) {
    try {
      return await this.repository.getStatistic(query);
    } catch (error) {
      throw error;
    }
  }
}
