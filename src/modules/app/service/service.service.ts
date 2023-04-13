import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceRepository } from './service.repository';
import { ServiceCreateDto } from './dto';

@Injectable()
export class ServiceService {
  constructor(
    private repository: ServiceRepository,
    private config: ConfigService,
  ) {}

  async createService(data: ServiceCreateDto) {}
}
