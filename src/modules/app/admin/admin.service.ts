import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { ListingParams } from 'src/core/dto';

@Injectable()
export class AdminService {
  constructor(private repository: AdminRepository) {}

  async getUpdateRequests(dto: ListingParams) {
    try {
      return await this.repository.getUpdateRequests(dto);
    } catch (error) {
      throw error;
    }
  }
}
