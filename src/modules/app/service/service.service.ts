import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceRepository } from './service.repository';
import { ServiceCreateDto, ServiceUpdateDto } from './dto';

@Injectable()
export class ServiceService {
  constructor(
    private repository: ServiceRepository,
    private config: ConfigService,
  ) {}

  async createService(data: ServiceCreateDto) {
    try {
      const service = await this.repository.createService(data);
      if (!service) {
        throw new BadRequestException('Unable to create this service');
      }
      return { statusCode: 201, message: 'Service Successfully Created' };
    } catch (error) {
      throw error;
    }
  }

  async updateService(data: ServiceUpdateDto) {
    try {
      // await this.repository.updateService
    } catch (error) {
      throw error;
    }
  }
}
