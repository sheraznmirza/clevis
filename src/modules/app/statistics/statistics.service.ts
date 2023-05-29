import { Injectable } from '@nestjs/common';
import { StatisticRepository } from './statistic.repository';

@Injectable()
export class StatisticsService {
  constructor(private repository: StatisticRepository) {}

  async statisticService(query) {
    try {
      return await this.repository.getStatistic(query);
    } catch (error) {
      throw error;
    }
  }
}
