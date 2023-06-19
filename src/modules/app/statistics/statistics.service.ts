import { Injectable } from '@nestjs/common';
import { StatisticRepository } from './statistic.repository';
import { StatisticVendorAdminQueryDto } from './dto/statistic.dto';
import { StatisticUserAdminQueryDto } from './dto/statistics.user.dto';
import { GetUserType } from 'src/core/dto';

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
  async statisticServices(query: StatisticUserAdminQueryDto) {
    try {
      return await this.repository.getStatistics(query);
    } catch (error) {
      throw error;
    }
  }

  async getDashboardEarnings(user: GetUserType) {
    try {
      return await this.repository.getDashboardEarnings(user);
    } catch (error) {
      throw error;
    }
  }

  async getDashboard(user: GetUserType) {
    try {
      return await this.repository.getDashboard(user);
    } catch (error) {
      throw error;
    }
  }

  async getRiderDashboard(user: GetUserType) {
    try {
      return await this.repository.getDashboard(user);
    } catch (error) {
      throw error;
    }
  }

  async geRiderTotalJobs(user: GetUserType) {
    try {
      return await this.repository.geRiderTotalJobs(user);
    } catch (error) {
      throw error;
    }
  }
}
